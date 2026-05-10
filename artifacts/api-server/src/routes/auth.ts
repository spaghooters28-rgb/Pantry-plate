import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { eq, ilike } from "drizzle-orm";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import { createIpRateLimit } from "../middleware/rateLimit";
import { requireSameOrigin } from "../middleware/originCheck";
import { requireAuth } from "../middleware/requireAuth";
import { sendPasswordResetEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const registerIpRateLimit = createIpRateLimit(5, 60 * 60 * 1000);
const loginIpRateLimit = createIpRateLimit(10, 15 * 60 * 1000);
const forgotIpRateLimit = createIpRateLimit(5, 60 * 60 * 1000);
const resetIpRateLimit = createIpRateLimit(10, 15 * 60 * 1000);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAppBaseUrl(req: import("express").Request): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    const first = domains.split(",")[0].trim();
    return `https://${first}`;
  }
  return `${req.protocol}://${req.get("host")}`;
}

// ── Register ─────────────────────────────────────────────────────────────────

router.post("/auth/register", requireSameOrigin, registerIpRateLimit, async (req, res): Promise<void> => {
  const { email, displayName, password } = req.body as {
    email?: string;
    displayName?: string;
    password?: string;
  };

  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }
  if (!displayName || typeof displayName !== "string" || displayName.trim().length < 1) {
    res.status(400).json({ error: "Display name is required" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = displayName.trim();

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(ilike(usersTable.email, trimmedEmail));

  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({
      username: trimmedEmail,
      email: trimmedEmail,
      displayName: trimmedName,
      passwordHash,
    })
    .returning();

  const resolvedEmail = user.email ?? trimmedEmail;
  const resolvedName = user.displayName ?? trimmedName;

  req.session.userId = user.id;
  req.session.email = resolvedEmail;
  req.session.displayName = resolvedName;

  res.status(201).json({ id: user.id, email: resolvedEmail, displayName: resolvedName, tier: user.tier ?? "free" });
});

// ── Login ─────────────────────────────────────────────────────────────────────

router.post("/auth/login", requireSameOrigin, loginIpRateLimit, async (req, res): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(ilike(usersTable.email, email.trim()));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const resolvedEmail = user.email ?? email.trim();
  const resolvedName = user.displayName ?? user.username;

  req.session.userId = user.id;
  req.session.email = resolvedEmail;
  req.session.displayName = resolvedName;

  res.json({ id: user.id, email: resolvedEmail, displayName: resolvedName, tier: user.tier ?? "free" });
});

// ── Logout ───────────────────────────────────────────────────────────────────

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.clearCookie("pp_session");
    res.json({ ok: true });
  });
});

// ── Me ───────────────────────────────────────────────────────────────────────

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email, displayName: usersTable.displayName, tier: usersTable.tier })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    tier: user.tier ?? "free",
  });
});

// ── Forgot Password ───────────────────────────────────────────────────────────

router.post("/auth/forgot-password", requireSameOrigin, forgotIpRateLimit, async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  // Always return success immediately to avoid leaking whether email exists
  res.json({ ok: true });

  const trimmedEmail = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(ilike(usersTable.email, trimmedEmail));

  if (!user) return;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokensTable).values({ token, userId: user.id, expiresAt });

  const baseUrl = getAppBaseUrl(req);
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const displayName = user.displayName ?? user.username;

  try {
    await sendPasswordResetEmail(trimmedEmail, displayName, resetUrl);
  } catch (err) {
    logger.error({ err }, "Failed to send password reset email");
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────

router.post("/auth/reset-password", requireSameOrigin, resetIpRateLimit, async (req, res): Promise<void> => {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Reset token is required" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [resetToken] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.token, token));

  if (!resetToken) {
    res.status(400).json({ error: "Invalid or expired reset link" });
    return;
  }
  if (resetToken.usedAt) {
    res.status(400).json({ error: "This reset link has already been used" });
    return;
  }
  if (resetToken.expiresAt < new Date()) {
    res.status(400).json({ error: "This reset link has expired. Please request a new one." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, resetToken.userId));
  await db
    .update(passwordResetTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokensTable.id, resetToken.id));

  res.json({ ok: true });
});

// ── Change Password (authenticated) ──────────────────────────────────────────

router.patch("/auth/password", requireAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current password and new password are required" });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId!));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));

  res.json({ ok: true });
});

export default router;
