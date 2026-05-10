import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const pinnedItemsTable = pgTable(
  "pinned_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemId: integer("item_id").notNull(),
    pinnedAt: timestamp("pinned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("pins_user_type_item").on(t.userId, t.itemType, t.itemId)]
);

export type PinnedItem = typeof pinnedItemsTable.$inferSelect;
