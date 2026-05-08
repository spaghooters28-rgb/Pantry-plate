import { pgTable, text, serial, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { mealsTable } from "./meals";

export const weeklyPlansTable = pgTable("weekly_plans", {
  id: serial("id").primaryKey(),
  weekStartDate: date("week_start_date").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWeeklyPlanSchema = createInsertSchema(weeklyPlansTable).omit({ id: true, generatedAt: true });
export type InsertWeeklyPlan = z.infer<typeof insertWeeklyPlanSchema>;
export type WeeklyPlan = typeof weeklyPlansTable.$inferSelect;

export const weeklyPlanDaysTable = pgTable("weekly_plan_days", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => weeklyPlansTable.id, { onDelete: "cascade" }),
  day: text("day").notNull(), // monday, tuesday, etc.
  mealId: integer("meal_id").references(() => mealsTable.id, { onDelete: "set null" }),
  selectedSideId: integer("selected_side_id"),
});

export const insertWeeklyPlanDaySchema = createInsertSchema(weeklyPlanDaysTable).omit({ id: true });
export type InsertWeeklyPlanDay = z.infer<typeof insertWeeklyPlanDaySchema>;
export type WeeklyPlanDay = typeof weeklyPlanDaysTable.$inferSelect;
