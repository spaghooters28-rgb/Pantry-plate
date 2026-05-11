import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type Tier = "free" | "pro" | "pro_ai";

const VALID_TIERS = new Set<string>(["free", "pro", "pro_ai"]);

const TIER_ORDER: Record<Tier, number> = { free: 0, pro: 1, pro_ai: 2 };

function sanitizeTier(raw: unknown): Tier {
  if (typeof raw === "string" && VALID_TIERS.has(raw)) return raw as Tier;
  return "free";
}

export async function getUserTier(userId: number): Promise<Tier> {
  const [row] = await db
    .select({ tier: usersTable.tier })
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return sanitizeTier(row?.tier);
}

export function requireTier(minTier: Tier) {
  return async function tierGate(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.session.userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    // In self-hosted mode all features are unlocked for authenticated users
    if (process.env.SELF_HOSTED === "true") {
      next();
      return;
    }
    const userTier = await getUserTier(req.session.userId);
    if (TIER_ORDER[userTier] < TIER_ORDER[minTier]) {
      res.status(403).json({
        error: "This feature requires a subscription upgrade.",
        requiredTier: minTier,
        currentTier: userTier,
        upgradePath: minTier === "pro_ai" ? "pro_ai" : "pro",
      });
      return;
    }
    next();
  };
}
