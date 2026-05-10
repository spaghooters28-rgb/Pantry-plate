import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const subscriptionEventsTable = pgTable("subscription_events", {
  id: serial("id").primaryKey(),
  stripeEventId: text("stripe_event_id").notNull().unique(),
  userId: integer("user_id"),
  eventType: text("event_type").notNull(),
  tier: text("tier"),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});
