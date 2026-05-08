import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const recipeHistoryTable = pgTable("recipe_history", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cuisine: text("cuisine").notNull().default("Other"),
  protein: text("protein").notNull().default(""),
  isGlutenFree: boolean("is_gluten_free").notNull().default(false),
  cookTimeMinutes: integer("cook_time_minutes").notNull().default(0),
  calories: integer("calories").notNull().default(0),
  instructions: text("instructions"),
  sourceUrl: text("source_url"),
  mealId: integer("meal_id"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RecipeHistory = typeof recipeHistoryTable.$inferSelect;
