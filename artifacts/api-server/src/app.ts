import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { handleStripeWebhook } from "./routes/billing";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import { allowedOrigins } from "./middleware/originCheck";

const PgSession = connectPgSimple(session);

const app: Express = express();

// Trust Replit's reverse proxy so req.secure is true in production
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.length === 0) {
        callback(null, !isProduction);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Stripe webhook must receive the raw request body BEFORE express.json() parses it
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    name: "pp_session",
    secret: process.env.SESSION_SECRET ?? "fallback-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  }),
);

app.use("/api", router);

// In self-hosted/production mode, serve the built React frontend and handle SPA routing.
// We try several candidate paths because the working directory can vary between
// hosting platforms (Render root-dir vs repo-root deployment modes).
if (process.env.NODE_ENV === "production") {
  const candidates = [
    path.resolve(__dirname, "public"),
    path.resolve(process.cwd(), "artifacts/api-server/dist/public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "public"),
  ];
  const publicDir = candidates.find((p) => existsSync(path.join(p, "index.html"))) ?? candidates[0];
  logger.info({ publicDir, exists: existsSync(publicDir) }, "serving static frontend");
  app.use(express.static(publicDir));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = (err as { status?: number; statusCode?: number }).status
    ?? (err as { status?: number; statusCode?: number }).statusCode
    ?? 500;
  req.log.error({ err }, "Unhandled route error");
  res.status(status).json({ error: "Internal server error" });
};

app.use(globalErrorHandler);

export default app;
