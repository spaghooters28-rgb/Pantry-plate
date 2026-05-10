import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const PgSession = connectPgSimple(session);

const app: Express = express();

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
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create session table explicitly — connect-pg-simple's built-in
// createTableIfMissing reads a .sql file that breaks when bundled with esbuild
pool.query(`
  CREATE TABLE IF NOT EXISTS "user_sessions" (
    "sid" varchar NOT NULL,
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid")
  );
  CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expire" ON "user_sessions" ("expire");
`).catch((err: unknown) => {
  logger.error({ err }, "Failed to create user_sessions table");
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
