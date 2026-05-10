import { pgTable, text, integer, primaryKey } from "drizzle-orm/pg-core";

export const aiUsageTable = pgTable(
  "ai_usage",
  {
    userId: integer("user_id").notNull(),
    yearMonth: text("year_month").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.yearMonth] })],
);
