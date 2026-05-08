import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scheduledItemsTable = pgTable("scheduled_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit"),
  category: text("category").notNull(),
  scheduleType: text("schedule_type").notNull(), // weekly | biweekly | every_other_day | custom
  scheduleDaysInterval: integer("schedule_days_interval"),
  nextDueDate: date("next_due_date").notNull(),
  lastAddedDate: date("last_added_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScheduledItemSchema = createInsertSchema(scheduledItemsTable).omit({ id: true, createdAt: true });
export type InsertScheduledItem = z.infer<typeof insertScheduledItemSchema>;
export type ScheduledItem = typeof scheduledItemsTable.$inferSelect;
