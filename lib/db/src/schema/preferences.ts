import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const preferencesTable = pgTable("preferences", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPreferencesSchema = createInsertSchema(preferencesTable).omit({ id: true, updatedAt: true });
export type InsertPreferences = z.infer<typeof insertPreferencesSchema>;
export type Preferences = typeof preferencesTable.$inferSelect;
