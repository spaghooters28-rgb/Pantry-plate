import { pgTable, integer, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { mealsTable } from "./meals";

export const userFavoritesTable = pgTable(
  "user_favorites",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    mealId: integer("meal_id")
      .notNull()
      .references(() => mealsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.mealId] })],
);
