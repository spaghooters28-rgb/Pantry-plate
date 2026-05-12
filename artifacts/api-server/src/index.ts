import app from "./app";
import { logger } from "./lib/logger";
import { pool, runMigrations, runSeed } from "@workspace/db";

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection — continuing");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  logger.info("Running database migrations…");
  await runMigrations(pool);
  logger.info("Migrations complete");

  logger.info("Running database seed check…");
  await runSeed(pool);
  logger.info("Seed check complete");

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

start().catch((err: unknown) => {
  logger.error({ err }, "Startup failed");
  process.exit(1);
});
