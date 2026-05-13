import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

const isProduction = process.env.NODE_ENV === "production";

function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Replit hosted environment
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

  // Render.com — RENDER_EXTERNAL_URL is injected automatically on every deploy
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (renderUrl) {
    origins.push(renderUrl.replace(/\/$/, ""));
  }

  // Generic self-hosted / other platforms: comma-separated full origins
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  if (allowedOriginsEnv) {
    for (const origin of allowedOriginsEnv.split(",")) {
      const trimmed = origin.trim();
      if (trimmed) origins.push(trimmed);
    }
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
        "Set RENDER_EXTERNAL_URL (auto on Render), REPLIT_DOMAINS (auto on Replit), " +
        "or ALLOWED_ORIGINS (comma-separated full origins) to enable cross-origin auth. " +
        "All cross-origin auth requests will be rejected until this is resolved.",
    );
  } else {
    logger.warn(
      "No allowed origins detected. " +
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
