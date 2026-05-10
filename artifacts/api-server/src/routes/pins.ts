import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, pinnedItemsTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

async function getPinnedForUser(userId: number) {
  const rows = await db
    .select()
    .from(pinnedItemsTable)
    .where(eq(pinnedItemsTable.userId, userId));

  const recipeIds: number[] = [];
  const mealIds: number[] = [];
  for (const row of rows) {
    if (row.itemType === "recipe") recipeIds.push(row.itemId);
    else if (row.itemType === "meal") mealIds.push(row.itemId);
  }
  return { recipeIds, mealIds };
}

router.get("/pins", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const result = await getPinnedForUser(userId);
  res.json(result);
});

router.post("/pins", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const body = req.body as { itemType?: unknown; itemId?: unknown };

  if (body.itemType !== "recipe" && body.itemType !== "meal") {
    res.status(400).json({ error: "itemType must be 'recipe' or 'meal'" });
    return;
  }
  const itemId = Number(body.itemId);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    res.status(400).json({ error: "itemId must be a positive integer" });
    return;
  }

  await db
    .insert(pinnedItemsTable)
    .values({ userId, itemType: body.itemType, itemId })
    .onConflictDoNothing();

  const result = await getPinnedForUser(userId);
  res.status(201).json(result);
});

router.delete("/pins/:itemType/:itemId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rawType = Array.isArray(req.params.itemType) ? req.params.itemType[0] : req.params.itemType;
  const rawId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const itemType = rawType;

  if (itemType !== "recipe" && itemType !== "meal") {
    res.status(400).json({ error: "itemType must be 'recipe' or 'meal'" });
    return;
  }
  const itemId = parseInt(rawId, 10);
  if (isNaN(itemId) || itemId <= 0) {
    res.status(400).json({ error: "itemId must be a positive integer" });
    return;
  }

  await db
    .delete(pinnedItemsTable)
    .where(
      and(
        eq(pinnedItemsTable.userId, userId),
        eq(pinnedItemsTable.itemType, itemType),
        eq(pinnedItemsTable.itemId, itemId)
      )
    );

  res.sendStatus(204);
});

router.post("/pins/sync", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const body = req.body as { recipeIds?: unknown; mealIds?: unknown };

  const recipeIds = Array.isArray(body.recipeIds)
    ? (body.recipeIds as unknown[]).filter((x): x is number => typeof x === "number" && Number.isInteger(x) && x > 0)
    : [];
  const mealIds = Array.isArray(body.mealIds)
    ? (body.mealIds as unknown[]).filter((x): x is number => typeof x === "number" && Number.isInteger(x) && x > 0)
    : [];

  const toInsert: Array<{ userId: number; itemType: string; itemId: number }> = [
    ...recipeIds.map((id) => ({ userId, itemType: "recipe" as const, itemId: id })),
    ...mealIds.map((id) => ({ userId, itemType: "meal" as const, itemId: id })),
  ];

  if (toInsert.length > 0) {
    await db.insert(pinnedItemsTable).values(toInsert).onConflictDoNothing();
  }

  const result = await getPinnedForUser(userId);
  res.json(result);
});

export default router;
