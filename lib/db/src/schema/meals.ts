import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mealsTable = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cuisine: text("cuisine").notNull(),
  protein: text("protein").notNull(),
  isGlutenFree: boolean("is_gluten_free").notNull().default(false),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  servings: integer("servings").notNull().default(4),
  calories: integer("calories").notNull(),
  imageUrl: text("image_url"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMealSchema = createInsertSchema(mealsTable).omit({ id: true, createdAt: true });
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Meal = typeof mealsTable.$inferSelect;

export const ingredientsTable = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull().references(() => mealsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  category: text("category").notNull(),
  isCommonPantryItem: boolean("is_common_pantry_item").notNull().default(false),
});

export const insertIngredientSchema = createInsertSchema(ingredientsTable).omit({ id: true });
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredientsTable.$inferSelect;

export const sidesTable = pgTable("sides", {
  id: serial("id").primaryKey(),
  mealId: integer("meal_id").notNull().references(() => mealsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const insertSideSchema = createInsertSchema(sidesTable).omit({ id: true });
export type InsertSide = z.infer<typeof insertSideSchema>;
export type Side = typeof sidesTable.$inferSelect;
