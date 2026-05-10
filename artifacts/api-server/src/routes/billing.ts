import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, usersTable, subscriptionEventsTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

function getAppBaseUrl(req: Request): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const first = domains.split(",")[0].trim();
    return `https://${first}`;
  }
  return `${req.protocol}://${req.get("host")}`;
}

function tierToPriceId(tier: "pro" | "pro_ai"): string | null {
  if (tier === "pro") return process.env.STRIPE_PRO_PRICE_ID ?? null;
  if (tier === "pro_ai") return process.env.STRIPE_PRO_AI_PRICE_ID ?? null;
  return null;
}

function priceTier(priceId: string): "pro" | "pro_ai" | null {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_PRO_AI_PRICE_ID) return "pro_ai";
  return null;
}

// ── POST /billing/checkout ────────────────────────────────────────────────────

router.post("/billing/checkout", requireAuth, async (req, res): Promise<void> => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment system is not configured yet. Please check back later." });
    return;
  }

  const { tier } = req.body as { tier?: string };
  if (tier !== "pro" && tier !== "pro_ai") {
    res.status(400).json({ error: "tier must be 'pro' or 'pro_ai'" });
    return;
  }

  const priceId = tierToPriceId(tier);
  if (!priceId) {
    res.status(503).json({ error: "Subscription price is not configured yet." });
    return;
  }

  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email, stripeCustomerId: usersTable.stripeCustomerId })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: String(user.id) },
    });
    customerId = customer.id;
    await db
      .update(usersTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(usersTable.id, user.id));
  }

  const baseUrl = getAppBaseUrl(req);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/settings?subscription=success`,
    cancel_url: `${baseUrl}/settings?subscription=cancelled`,
    metadata: { userId: String(user.id), tier },
    subscription_data: { metadata: { userId: String(user.id), tier } },
  });

  res.json({ url: session.url });
});

// ── POST /billing/portal ───────────────────────────────────────────────────────

router.post("/billing/portal", requireAuth, async (req, res): Promise<void> => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).json({ error: "Payment system is not configured yet." });
    return;
  }

  const [user] = await db
    .select({ stripeCustomerId: usersTable.stripeCustomerId })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!));

  if (!user?.stripeCustomerId) {
    res.status(400).json({ error: "No active subscription found." });
    return;
  }

  const baseUrl = getAppBaseUrl(req);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/settings`,
  });

  res.json({ url: portalSession.url });
});

// ── POST /billing/usage ────────────────────────────────────────────────────────

router.get("/billing/usage", requireAuth, async (req, res): Promise<void> => {
  const { getAiUsage } = await import("../lib/aiUsage");
  const usage = await getAiUsage(req.session.userId!);
  res.json(usage);
});

export default router;

// ── Stripe webhook handler (mounted in app.ts with express.raw()) ──────────────

export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    res.status(503).send("Stripe not configured");
    return;
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).send("Missing signature or webhook secret");
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err) {
    logger.warn({ err }, "Stripe webhook signature verification failed");
    res.status(400).send("Invalid signature");
    return;
  }

  // Idempotency: skip if we already processed this event
  try {
    await db.insert(subscriptionEventsTable).values({
      stripeEventId: event.id,
      eventType: event.type,
    });
  } catch {
    // Unique constraint violation = already processed
    res.json({ received: true, skipped: true });
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") {
        res.json({ received: true });
        return;
      }
      const userId = session.metadata?.userId ? parseInt(session.metadata.userId, 10) : null;
      const tier = (session.metadata?.tier as "pro" | "pro_ai") ?? null;
      if (userId && tier) {
        await db.update(usersTable).set({ tier }).where(eq(usersTable.id, userId));
        await db
          .update(subscriptionEventsTable)
          .set({ userId, tier })
          .where(eq(subscriptionEventsTable.stripeEventId, event.id));
        logger.info({ userId, tier }, "Subscription activated via checkout");
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId ? parseInt(sub.metadata.userId, 10) : null;

      if (event.type === "customer.subscription.deleted") {
        if (userId) {
          await db.update(usersTable).set({ tier: "free" }).where(eq(usersTable.id, userId));
          logger.info({ userId }, "Subscription cancelled, tier set to free");
        }
      } else if (event.type === "customer.subscription.updated") {
        if (userId && sub.status === "active") {
          const priceId = sub.items.data[0]?.price?.id;
          if (priceId) {
            const newTier = priceTier(priceId);
            if (newTier) {
              await db.update(usersTable).set({ tier: newTier }).where(eq(usersTable.id, userId));
              logger.info({ userId, newTier }, "Subscription tier updated");
            }
          }
        } else if (userId && (sub.status === "canceled" || sub.status === "unpaid")) {
          await db.update(usersTable).set({ tier: "free" }).where(eq(usersTable.id, userId));
          logger.info({ userId, status: sub.status }, "Subscription inactive, tier set to free");
        }
      }
    }
  } catch (err) {
    logger.error({ err, eventId: event.id }, "Error processing Stripe webhook event");
    res.status(500).send("Webhook processing error");
    return;
  }

  res.json({ received: true });
}
