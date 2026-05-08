import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { mealsTable } from "./meals";

export const groceryItemsTable = pgTable("grocery_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit"),
  category: text("category").notNull(),
  isChecked: boolean("is_checked").notNull().default(false),
  isCustom: boolean("is_custom").notNull().default(false),
  mealId: integer("meal_id").references(() => mealsTable.id, { onDelete: "set null" }),
  mealName: text("meal_name"),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGroceryItemSchema = createInsertSchema(groceryItemsTable).omit({ id: true, addedAt: true });
export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type GroceryItem = typeof groceryItemsTable.$inferSelect;
