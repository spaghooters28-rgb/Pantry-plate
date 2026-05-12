import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { seedMeals } from "../../lib/db/src/seed-data.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cuisine: text("cuisine").notNull(),
  protein: text("protein").notNull(),
  isGlutenFree: boolean("is_gluten_free").notNull().default(false),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  servings: integer("servings").notNull(),
  calories: integer("calories").notNull(),
  tags: text("tags").array().notNull().default([]),
  instructions: text("instructions").notNull(),
  imageUrl: text("image_url"),
});

const ingredientsTable = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(),
  isCommonPantryItem: boolean("is_common_pantry_item").notNull().default(false),
});

const sidesTable = pgTable("sides", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

const db = drizzle(pool);

async function reseed() {
  console.log("Starting reseed — clearing existing meal data...");

  await db.delete(ingredientsTable);
  await db.delete(sidesTable);
  await db.delete(mealsTable);

  console.log(`Cleared. Inserting ${seedMeals.length} meals...`);

  let inserted = 0;
  for (const meal of seedMeals) {
    const { ingredients, sides, ...mealData } = meal;

    const [row] = await db
      .insert(mealsTable)
      .values({ ...mealData, imageUrl: null })
      .returning();

    if (!row) continue;

    if (ingredients.length > 0) {
      await db.insert(ingredientsTable).values(
        ingredients.map((ing) => ({
          mealId: row.id,
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
          mealId: row.id,
          name: side.name,
          description: side.description,
        }))
      );
    }

    inserted++;
    if (inserted % 25 === 0) {
      console.log(`  ${inserted}/${seedMeals.length} meals inserted...`);
    }
  }

  console.log(`Done — ${inserted} meals reseeded successfully.`);
  await pool.end();
  process.exit(0);
}

reseed().catch((err) => {
  console.error("Reseed failed:", err);
  process.exit(1);
});
