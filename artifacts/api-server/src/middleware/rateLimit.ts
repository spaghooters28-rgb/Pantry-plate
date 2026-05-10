import { Request, Response, NextFunction } from "express";

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

function checkLimit(key: string, maxRequests: number, windowMs: number, res: Response): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({ error: "Too many requests. Please wait before trying again." });
    return false;
  }

  entry.count += 1;
  return true;
}

export function createUserRateLimit(maxRequests: number, windowMs: number) {
  return function userRateLimit(req: Request, res: Response, next: NextFunction): void {
    const userId = req.session.userId;
    if (!userId) {
      next();
      return;
    }

    const key = `user:${req.path}:${userId}`;
    if (checkLimit(key, maxRequests, windowMs, res)) {
      next();
    }
  };
}

export function createIpRateLimit(maxRequests: number, windowMs: number) {
  return function ipRateLimit(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const key = `ip:${req.path}:${ip}`;
    if (checkLimit(key, maxRequests, windowMs, res)) {
      next();
    }
  };
}
