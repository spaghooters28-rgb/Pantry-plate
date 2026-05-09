import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, scheduledItemsTable } from "@workspace/db";
import {
  CreateScheduledItemBody,
  UpdateScheduledItemParams,
  UpdateScheduledItemBody,
  DeleteScheduledItemParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

function getIntervalDays(scheduleType: string, customInterval?: number | null): number {
  switch (scheduleType) {
    case "weekly": return 7;
    case "biweekly": return 14;
    case "every_other_day": return 2;
    case "custom": return customInterval ?? 7;
    default: return 7;
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

router.get("/scheduled-items", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const items = await db.select().from(scheduledItemsTable)
    .where(eq(scheduledItemsTable.userId, userId));
  res.json(items.map((i) => ({
    ...i,
    unit: i.unit ?? null,
    scheduleDaysInterval: i.scheduleDaysInterval ?? null,
    lastAddedDate: i.lastAddedDate ?? null,
  })));
});

router.post("/scheduled-items", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CreateScheduledItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const interval = getIntervalDays(parsed.data.scheduleType, parsed.data.scheduleDaysInterval);
  const nextDue = addDays(todayStr(), interval);

  const [item] = await db
    .insert(scheduledItemsTable)
    .values({
      userId,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit ?? null,
      category: parsed.data.category,
      scheduleType: parsed.data.scheduleType,
      scheduleDaysInterval: parsed.data.scheduleDaysInterval ?? null,
      nextDueDate: nextDue,
      isActive: true,
    })
    .returning();

  res.status(201).json({
    ...item,
    unit: item.unit ?? null,
    scheduleDaysInterval: item.scheduleDaysInterval ?? null,
    lastAddedDate: item.lastAddedDate ?? null,
  });
});

router.patch("/scheduled-items/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateScheduledItemParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateScheduledItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined && parsed.data.name !== null) updateData.name = parsed.data.name;
  if (parsed.data.quantity !== undefined && parsed.data.quantity !== null) updateData.quantity = parsed.data.quantity;
  if (parsed.data.scheduleType !== undefined && parsed.data.scheduleType !== null) updateData.scheduleType = parsed.data.scheduleType;
  if (parsed.data.scheduleDaysInterval !== undefined) updateData.scheduleDaysInterval = parsed.data.scheduleDaysInterval;
  if (parsed.data.isActive !== undefined && parsed.data.isActive !== null) updateData.isActive = parsed.data.isActive;
  if (parsed.data.nextDueDate !== undefined && parsed.data.nextDueDate !== null) updateData.nextDueDate = parsed.data.nextDueDate;

  const [item] = await db
    .update(scheduledItemsTable)
    .set(updateData)
    .where(eq(scheduledItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Scheduled item not found" });
    return;
  }

  res.json({
    ...item,
    unit: item.unit ?? null,
    scheduleDaysInterval: item.scheduleDaysInterval ?? null,
    lastAddedDate: item.lastAddedDate ?? null,
  });
});

router.delete("/scheduled-items/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteScheduledItemParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(scheduledItemsTable)
    .where(eq(scheduledItemsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Scheduled item not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/scheduled-items/due-today", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const today = todayStr();
  const dueItems = await db
    .select()
    .from(scheduledItemsTable)
    .where(and(eq(scheduledItemsTable.userId, userId), eq(scheduledItemsTable.isActive, true)));

  const due = dueItems.filter((i) => i.nextDueDate <= today);

  res.json(due.map((i) => ({
    ...i,
    unit: i.unit ?? null,
    scheduleDaysInterval: i.scheduleDaysInterval ?? null,
    lastAddedDate: i.lastAddedDate ?? null,
  })));
});

export default router;
