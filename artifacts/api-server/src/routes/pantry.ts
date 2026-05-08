import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, pantryItemsTable, ingredientsTable, mealsTable, groceryItemsTable } from "@workspace/db";
import {
  AddPantryItemBody,
  UpdatePantryItemParams,
  UpdatePantryItemBody,
  DeletePantryItemParams,
  CheckPantryForMealBody,
  MovePantryItemToGroceryParams,
  MovePantryItemToGroceryBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildPantryItemResponse(item: typeof pantryItemsTable.$inferSelect) {
  // Find meals that use this ingredient
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

router.get("/pantry", async (_req, res): Promise<void> => {
  const items = await db.select().from(pantryItemsTable);
  const withMeals = await Promise.all(items.map(buildPantryItemResponse));
  res.json(withMeals);
});

router.post("/pantry/items", async (req, res): Promise<void> => {
  const parsed = AddPantryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check if item already exists (case-insensitive)
  const existing = await db
    .select()
    .from(pantryItemsTable)
    .where(ilike(pantryItemsTable.name, parsed.data.name));

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
      name: parsed.data.name,
      quantity: parsed.data.quantity ?? null,
      category: parsed.data.category,
      inStock: true,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  res.status(201).json(await buildPantryItemResponse(item));
});

router.patch("/pantry/items/:id", async (req, res): Promise<void> => {
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
    .where(eq(pantryItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Pantry item not found" });
    return;
  }

  res.json(await buildPantryItemResponse(item));
});

router.delete("/pantry/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePantryItemParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(pantryItemsTable)
    .where(eq(pantryItemsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Pantry item not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/pantry/items/:id/to-grocery", async (req, res): Promise<void> => {
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

  const [item] = await db.select().from(pantryItemsTable).where(eq(pantryItemsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Pantry item not found" });
    return;
  }

  // Prevent duplicates — skip insert if item already in grocery list
  const [existingGrocery] = await db
    .select()
    .from(groceryItemsTable)
    .where(ilike(groceryItemsTable.name, item.name));

  if (!existingGrocery) {
    await db.insert(groceryItemsTable).values({
      name: item.name,
      quantity: item.quantity ?? "1",
      unit: null,
      category: item.category,
      isChecked: false,
      isCustom: true,
      mealId: null,
      mealName: null,
    });
  }

  if (parsed.data.removeFromPantry) {
    await db.delete(pantryItemsTable).where(eq(pantryItemsTable.id, params.data.id));
  }

  res.json({ success: true });
});

router.post("/pantry/check", async (req, res): Promise<void> => {
  const parsed = CheckPantryForMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const mealIngredients = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.mealId, parsed.data.mealId));

  const pantryItems = await db.select().from(pantryItemsTable).where(eq(pantryItemsTable.inStock, true));

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
