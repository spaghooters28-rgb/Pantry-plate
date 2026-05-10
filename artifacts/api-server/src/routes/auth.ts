import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { ilike } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { createIpRateLimit } from "../middleware/rateLimit";

const router: IRouter = Router();

const registerIpRateLimit = createIpRateLimit(5, 60 * 60 * 1000);

router.post("/auth/register", registerIpRateLimit, async (req, res): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const trimmedUsername = username.trim().toLowerCase();

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(ilike(usersTable.username, trimmedUsername));

  if (existing) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ username: trimmedUsername, passwordHash })
    .returning();

  req.session.userId = user.id;
  req.session.username = user.username;

  res.status(201).json({ id: user.id, username: user.username });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(ilike(usersTable.username, username.trim()));

  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ id: user.id, username: user.username });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.clearCookie("pp_session");
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res): void => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ id: req.session.userId, username: req.session.username });
});

export default router;
