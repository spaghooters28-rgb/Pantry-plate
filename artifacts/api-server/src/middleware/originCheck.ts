import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

const isProduction = process.env.NODE_ENV === "production";

function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    for (const domain of replitDomains.split(",")) {
      const trimmed = domain.trim();
      if (trimmed) origins.push(`https://${trimmed}`);
    }
  }

  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  if (devDomain) {
    origins.push(`https://${devDomain}`);
  }

  if (!isProduction) {
    origins.push("http://localhost:5173", "http://localhost:3000");
  }

  return origins;
}

const allowedOrigins = getAllowedOrigins();

if (allowedOrigins.length === 0) {
  if (isProduction) {
    logger.error(
      "No allowed origins configured in production. " +
        "Set REPLIT_DOMAINS or REPLIT_DEV_DOMAIN to restrict CSRF exposure. " +
        "All cross-origin auth requests will be rejected.",
    );
  } else {
    logger.warn(
      "No allowed origins detected (REPLIT_DOMAINS / REPLIT_DEV_DOMAIN unset). " +
        "Origin validation is disabled in development mode.",
    );
  }
}

/**
 * Middleware that enforces same-origin requests on state-changing auth endpoints.
 *
 * Two complementary checks are applied:
 *
 * 1. Content-Type guard — browsers always send HTML form POSTs with
 *    `application/x-www-form-urlencoded` (or `multipart/form-data`). Rejecting
 *    anything that is not `application/json` blocks classic login-CSRF form
 *    submissions regardless of whether an Origin header is present.
 *
 * 2. Origin allowlist — when an `Origin` header is present the value must
 *    match one of the known application domains derived from Replit environment
 *    variables. In production an empty allowlist is fail-closed (all
 *    cross-origin requests are rejected). In non-production environments an
 *    empty allowlist is permissive so local development without Replit env
 *    vars is not broken.
 */
export function requireSameOrigin(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.startsWith("application/json")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const origin = req.headers.origin;
  if (!origin) {
    next();
    return;
  }

  if (allowedOrigins.length === 0) {
    if (isProduction) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
    return;
  }

  if (allowedOrigins.includes(origin)) {
    next();
    return;
  }

  res.status(403).json({ error: "Forbidden" });
}

export { getAllowedOrigins, allowedOrigins };
