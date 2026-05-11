import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Pool } from "pg";

// The build step copies lib/db/drizzle/ into dist/drizzle/ so the path is
// always relative to __dirname (set to the dist directory by the esbuild banner).
const migrationsFolder = path.join(__dirname, "drizzle");

export async function runMigrations(pool: Pool): Promise<void> {
  const { rows } = await pool.query<{ has_users: boolean; has_tracking: boolean }>(`
    SELECT
      EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS has_users,
      EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      ) AS has_tracking
  `);

  if (rows[0].has_users && !rows[0].has_tracking) {
    // Existing database that pre-dates Drizzle migration tracking.
    // Baseline assumption: a DB with a "users" table is already fully
    // initialized. Mark the initial migration as applied so migrate() does not
    // attempt to re-create tables that already exist. If your DB is only
    // partially initialized, drop it and let the server recreate it from scratch.
    // Read the journal to get the initial migration entry, compute its hash,
    // and insert a baseline record so migrate() skips the initial migration.
    const journal = JSON.parse(
      readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf8")
    ) as { entries: Array<{ tag: string; when: number }> };

    const first = journal.entries[0];
    if (first) {
      const sql = readFileSync(path.join(migrationsFolder, `${first.tag}.sql`), "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");

      await pool.query(`CREATE SCHEMA IF NOT EXISTS drizzle`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS drizzle."__drizzle_migrations" (
          id serial PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        )
      `);
      await pool.query(
        `INSERT INTO drizzle."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, first.when]
      );
    }
  }

  await migrate(drizzle(pool), { migrationsFolder });
}
