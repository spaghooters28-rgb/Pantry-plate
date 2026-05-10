import { Request, Response, NextFunction } from "express";

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

export function createUserRateLimit(maxRequests: number, windowMs: number) {
  return function userRateLimit(req: Request, res: Response, next: NextFunction): void {
    const userId = req.session.userId;
    if (!userId) {
      next();
      return;
    }

    const key = `${req.path}:${userId}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({ error: "Too many requests. Please wait before trying again." });
      return;
    }

    entry.count += 1;
    next();
  };
}
