import { Router, type IRouter } from "express";
import { eq, and, ilike, asc } from "drizzle-orm";
import { db, pantryItemsTable, ingredientsTable, mealsTable, sidesTable, groceryItemsTable } from "@workspace/db";
import {
  AddPantryItemBody,
  UpdatePantryItemParams,
  UpdatePantryItemBody,
  DeletePantryItemParams,
  CheckPantryForMealBody,
  MovePantryItemToGroceryParams,
  MovePantryItemToGroceryBody,
} from "@workspace/api-zod";
import { expandAbbreviation } from "../lib/expand-abbreviation";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

async function buildPantryItemResponse(item: typeof pantryItemsTable.$inferSelect) {
  const matchingIngredients = await db
    .select({ mealId: ingredientsTable.mealId })
    .from(ingredientsTable)
    .where(ilike(ingredientsTable.name, `%${item.name}%`));

  const mealIds = [...new Set(matchingIngredients.map((i) => i.mealId))];
  const meals = mealIds.length > 0
    ? await db.select({ id: mealsTable.id, name: mealsTable.name }).from(mealsTable)
      .then((all) => all.filter((m) => mealIds.includes(m.id)))
    : [];

  return {
    ...item,
    quantity: item.quantity ?? null,
    lastVerifiedAt: item.lastVerifiedAt?.toISOString() ?? null,
    notes: item.notes ?? null,
    usedInMeals: meals.map((m) => m.name),
  };
}

router.get("/pantry", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const items = await db.select().from(pantryItemsTable)
    .where(eq(pantryItemsTable.userId, userId))
    .orderBy(asc(pantryItemsTable.id));
  const withMeals = await Promise.all(items.map(buildPantryItemResponse));
  res.json(withMeals);
});

router.post("/pantry/items", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = AddPantryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const name = expandAbbreviation(parsed.data.name);

  const existing = await db
    .select()
    .from(pantryItemsTable)
    .where(and(eq(pantryItemsTable.userId, userId), ilike(pantryItemsTable.name, name)));

  if (existing.length > 0) {
    const [updated] = await db
      .update(pantryItemsTable)
      .set({ inStock: true, quantity: parsed.data.quantity ?? null, notes: parsed.data.notes ?? null })
      .where(eq(pantryItemsTable.id, existing[0].id))
      .returning();
    res.status(201).json(await buildPantryItemResponse(updated));
    return;
  }

  const [item] = await db
    .insert(pantryItemsTable)
    .values({
      userId,
      name,
      quantity: parsed.data.quantity ?? null,
      category: parsed.data.category,
      inStock: true,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  res.status(201).json(await buildPantryItemResponse(item));
});

router.patch("/pantry/items/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePantryItemParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePantryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.inStock !== undefined && parsed.data.inStock !== null) updateData.inStock = parsed.data.inStock;
  if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.lastVerifiedAt !== undefined) updateData.lastVerifiedAt = parsed.data.lastVerifiedAt;

  const [item] = await db
    .update(pantryItemsTable)
    .set(updateData)
    .where(and(eq(pantryItemsTable.id, params.data.id), eq(pantryItemsTable.userId, userId)))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Pantry item not found" });
    return;
  }

  res.json(await buildPantryItemResponse(item));
});

router.delete("/pantry/items/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePantryItemParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(pantryItemsTable)
    .where(and(eq(pantryItemsTable.id, params.data.id), eq(pantryItemsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Pantry item not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/pantry/items/:id/to-grocery", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = MovePantryItemToGroceryParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = MovePantryItemToGroceryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.select().from(pantryItemsTable)
    .where(and(eq(pantryItemsTable.id, params.data.id), eq(pantryItemsTable.userId, userId)));
  if (!item) {
    res.status(404).json({ error: "Pantry item not found" });
    return;
  }

  const [existingGrocery] = await db
    .select()
    .from(groceryItemsTable)
    .where(and(eq(groceryItemsTable.userId, userId), ilike(groceryItemsTable.name, item.name)));

  if (!existingGrocery) {
    await db.insert(groceryItemsTable).values({
      userId,
      name: item.name,
      quantity: "1",
      unit: null,
      category: item.category,
      isChecked: false,
      isCustom: true,
      mealId: null,
      mealName: null,
    });
  }

  if (parsed.data.removeFromPantry) {
    await db.delete(pantryItemsTable)
      .where(and(eq(pantryItemsTable.id, params.data.id), eq(pantryItemsTable.userId, userId)));
  }

  res.json({ success: true });
});

router.delete("/pantry/all", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const deleted = await db.delete(pantryItemsTable)
    .where(eq(pantryItemsTable.userId, userId))
    .returning();
  res.json({ deleted: deleted.length });
});

router.get("/pantry/available-recipes", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const pantryItems = await db
    .select()
    .from(pantryItemsTable)
    .where(and(eq(pantryItemsTable.userId, userId), eq(pantryItemsTable.inStock, true)));

  const allMeals = await db.select().from(mealsTable);

  const allIngredients = await db.select().from(ingredientsTable);
  const ingredientsByMeal = new Map<number, (typeof ingredientsTable.$inferSelect)[]>();
  for (const ing of allIngredients) {
    const existing = ingredientsByMeal.get(ing.mealId) ?? [];
    existing.push(ing);
    ingredientsByMeal.set(ing.mealId, existing);
  }

  const allSides = await db.select().from(sidesTable);
  const sidesByMeal = new Map<number, (typeof sidesTable.$inferSelect)[]>();
  for (const side of allSides) {
    const existing = sidesByMeal.get(side.mealId) ?? [];
    existing.push(side);
    sidesByMeal.set(side.mealId, existing);
  }

  const pantryNames = pantryItems.map((p) => p.name.toLowerCase());

  function isInPantry(ingredientName: string): boolean {
    const name = ingredientName.toLowerCase();
    return pantryNames.some((p) => p.includes(name) || name.includes(p));
  }

  const results: object[] = [];

  for (const meal of allMeals) {
    const ingredients = ingredientsByMeal.get(meal.id) ?? [];
    const sides = sidesByMeal.get(meal.id) ?? [];

    const keyIngredients = ingredients.filter((i) => !i.isCommonPantryItem);

    if (keyIngredients.length === 0) continue;

    const missing = keyIngredients.filter((i) => !isInPantry(i.name));
    const matchScore = (keyIngredients.length - missing.length) / keyIngredients.length;

    if (matchScore >= 0.5) {
      results.push({
        ...meal,
        imageUrl: meal.imageUrl ?? null,
        instructions: meal.instructions ?? null,
        ingredients,
        availableSides: sides,
        matchScore,
        missingIngredients: missing.map((i) => i.name),
      });
    }
  }

  results.sort((a, b) => {
    const ra = a as { matchScore: number };
    const rb = b as { matchScore: number };
    return rb.matchScore - ra.matchScore;
  });

  res.json(results);
});

router.post("/pantry/check", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const parsed = CheckPantryForMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const mealIngredients = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.mealId, parsed.data.mealId));

  const pantryItems = await db.select().from(pantryItemsTable)
    .where(and(eq(pantryItemsTable.userId, userId), eq(pantryItemsTable.inStock, true)));

  const haveInPantry: (typeof pantryItemsTable.$inferSelect)[] = [];
  const needToBuy: (typeof ingredientsTable.$inferSelect)[] = [];

  for (const ingredient of mealIngredients) {
    const inPantry = pantryItems.find(
      (p) => p.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
             ingredient.name.toLowerCase().includes(p.name.toLowerCase())
    );
    if (inPantry) {
      haveInPantry.push(inPantry);
    } else {
      needToBuy.push(ingredient);
    }
  }

  const haveWithMeals = await Promise.all(haveInPantry.map(buildPantryItemResponse));

  res.json({ haveInPantry: haveWithMeals, needToBuy });
});

export default router;
