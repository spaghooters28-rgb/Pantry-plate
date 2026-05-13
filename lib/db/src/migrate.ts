import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Pool } from "pg";
import { mealsTable, ingredientsTable, sidesTable, pantryItemsTable } from "./schema";
import { seedMeals, seedPantryItems } from "./seed-data";

// In ESM (tsx), __dirname is not defined — use import.meta.url as a fallback.
// In the esbuild CJS bundle, __dirname is injected via a banner and takes priority.
const _dirname: string =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// The build step copies lib/db/drizzle/ into dist/drizzle/ so the path is
// always relative to _dirname (set to the dist directory by the esbuild banner).
const migrationsFolder = path.join(_dirname, "drizzle");

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

export async function runSeed(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    // Fetch names of all already-seeded (non-user-created) meals for O(1) lookup
    const { rows: existingRows } = await client.query<{ name: string }>(
      `SELECT name FROM meals WHERE created_by_user_id IS NULL`
    );
    const existingNames = new Set(existingRows.map((r) => r.name.toLowerCase()));

    const mealsToInsert = seedMeals.filter(
      (m) => !existingNames.has(m.name.toLowerCase())
    );

    const db = drizzle(client);

    if (mealsToInsert.length === 0 && existingNames.size > 0) {
      // All seed meals already present — skip to pantry check below
    } else if (mealsToInsert.length > 0) {
      await client.query("BEGIN");

      for (const meal of mealsToInsert) {
        const { ingredients, sides, ...mealData } = meal;

        const [inserted] = await db
          .insert(mealsTable)
          .values({ ...mealData, imageUrl: null })
          .returning();

        if (!inserted) continue;

        if (ingredients.length > 0) {
          await db.insert(ingredientsTable).values(
            ingredients.map((ing) => ({
              mealId: inserted.id,
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              category: ing.category,
              isCommonPantryItem: ing.isCommonPantryItem,
            }))
          );
        }

        if (sides.length > 0) {
          await db.insert(sidesTable).values(
            sides.map((side) => ({
              mealId: inserted.id,
              name: side.name,
              description: side.description,
            }))
          );
        }
      }

      await client.query("COMMIT");
    }

    const { rows: pantryRows } = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM pantry_items WHERE user_id IS NULL`
    );
    const pantryCount = parseInt(pantryRows[0]?.count ?? "0", 10);

    if (pantryCount === 0) {
      await db.insert(pantryItemsTable).values(
        seedPantryItems.map((item) => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          inStock: item.inStock,
          userId: null,
          notes: null,
        }))
      );
    }
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
