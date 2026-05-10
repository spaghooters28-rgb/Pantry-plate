import { Router, type IRouter } from "express";
import { eq, and, desc, ilike } from "drizzle-orm";
import { db, recipeHistoryTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

router.post("/history", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const body = req.body as {
    name?: string;
    cuisine?: string | null;
    protein?: string | null;
    isGlutenFree?: boolean | null;
    cookTimeMinutes?: number | null;
    calories?: number | null;
    instructions?: string | null;
    sourceUrl?: string | null;
    mealId?: number | null;
  };

  if (!body.name || typeof body.name !== "string") {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const [existing] = await db
    .select()
    .from(recipeHistoryTable)
    .where(and(eq(recipeHistoryTable.userId, userId), ilike(recipeHistoryTable.name, body.name)))
    .limit(1);

  if (existing) {
    res.status(201).json({
      ...existing,
      instructions: existing.instructions ?? null,
      sourceUrl: existing.sourceUrl ?? null,
      mealId: existing.mealId ?? null,
    });
    return;
  }

  const [entry] = await db.insert(recipeHistoryTable).values({
    userId,
    name: body.name,
    cuisine: body.cuisine ?? "Other",
    protein: body.protein ?? "",
    isGlutenFree: body.isGlutenFree ?? false,
    cookTimeMinutes: body.cookTimeMinutes ?? 0,
    calories: body.calories ?? 0,
    instructions: body.instructions ?? null,
    sourceUrl: body.sourceUrl ?? null,
    mealId: body.mealId ?? null,
  }).returning();

  res.status(201).json({
    ...entry,
    instructions: entry.instructions ?? null,
    sourceUrl: entry.sourceUrl ?? null,
    mealId: entry.mealId ?? null,
  });
});

router.get("/history", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const all = await db.select().from(recipeHistoryTable)
    .where(eq(recipeHistoryTable.userId, userId))
    .orderBy(desc(recipeHistoryTable.addedAt));

  const seen = new Map<string, number>();
  for (const e of all) {
    const key = e.name.toLowerCase().trim();
    if (seen.has(key)) {
      await db.delete(recipeHistoryTable).where(eq(recipeHistoryTable.id, e.id));
    } else {
      seen.set(key, e.id);
    }
  }

  const entries = await db
    .select()
    .from(recipeHistoryTable)
    .where(eq(recipeHistoryTable.userId, userId))
    .orderBy(desc(recipeHistoryTable.addedAt));

  res.json(
    entries.map((e) => ({
      ...e,
      instructions: e.instructions ?? null,
      sourceUrl: e.sourceUrl ?? null,
      mealId: e.mealId ?? null,
    }))
  );
});

router.delete("/history/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(recipeHistoryTable)
    .where(and(eq(recipeHistoryTable.id, id), eq(recipeHistoryTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "History entry not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
