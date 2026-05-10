import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import { allowedOrigins } from "./middleware/originCheck";

const PgSession = connectPgSimple(session);

const app: Express = express();

// Trust Replit's reverse proxy so req.secure is true in production
// (without this, express-session won't send Secure cookies because the
// internal connection is HTTP even though the external one is HTTPS)
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Run startup migrations — drizzle-kit push requires an interactive TTY so we
// apply schema changes that can't be done interactively here instead.
pool.query(`
  CREATE TABLE IF NOT EXISTS "user_sessions" (
    "sid" varchar NOT NULL,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid")
  );
  CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expire" ON "user_sessions" ("expire");

  CREATE TABLE IF NOT EXISTS "pinned_items" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "item_type" text NOT NULL,
    "item_id" integer NOT NULL,
    "pinned_at" timestamp DEFAULT now() NOT NULL,
    UNIQUE("user_id", "item_type", "item_id")
  );

  ALTER TABLE "conversations"
    ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES "users"("id") ON DELETE CASCADE;

  ALTER TABLE "meals"
    ADD COLUMN IF NOT EXISTS "created_by_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL;
`).catch((err: unknown) => {
  logger.error({ err }, "Failed to run startup migrations");
});

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: false,
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

export default app;
