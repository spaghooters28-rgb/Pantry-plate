import { Router, type IRouter } from "express";
import { eq, and, ilike, asc } from "drizzle-orm";
import { db, groceryItemsTable, ingredientsTable, mealsTable, pantryItemsTable, scheduledItemsTable, recipeHistoryTable } from "@workspace/db";
import {
  AddGroceryItemBody,
  UpdateGroceryItemParams,
  UpdateGroceryItemBody,
  DeleteGroceryItemParams,
  AddMealToGroceryListParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CATEGORY_ORDER = [
  "Produce", "Meat & Seafood", "Dairy & Eggs", "Grains & Bread", "Bakery",
  "Canned Goods", "Condiments & Sauces", "Snacks", "Desserts", "Beverages",
  "Frozen", "Pantry", "Cleaning", "Personal Care", "Other",
];

function groupByCategory(items: (typeof groceryItemsTable.$inferSelect)[]) {
  const grouped: Record<string, (typeof groceryItemsTable.$inferSelect)[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const categories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return categories.map((cat) => ({
    category: cat,
    items: grouped[cat].map((i) => ({
      ...i,
      unit: i.unit ?? null,
      mealId: i.mealId ?? null,
      mealName: i.mealName ?? null,
    })),
  }));
}

async function deduplicateGroceryList() {
  const items = await db.select().from(groceryItemsTable).orderBy(asc(groceryItemsTable.id));
  const seen = new Map<string, number>(); // lowercase name → first id to keep
  const toDelete: number[] = [];
  for (const item of items) {
    const key = item.name.toLowerCase().trim();
    if (seen.has(key)) {
      toDelete.push(item.id);
    } else {
      seen.set(key, item.id);
    }
  }
  if (toDelete.length > 0) {
    for (const id of toDelete) {
      await db.delete(groceryItemsTable).where(eq(groceryItemsTable.id, id));
    }
  }
}

async function buildGroceryListResponse() {
  await deduplicateGroceryList();
  const items = await db.select().from(groceryItemsTable).orderBy(asc(groceryItemsTable.id));
  const categories = groupByCategory(items);
  return {
    categories,
    totalItems: items.length,
    checkedItems: items.filter((i) => i.isChecked).length,
  };
}

router.get("/grocery-list", async (_req, res): Promise<void> => {
  res.json(await buildGroceryListResponse());
});

router.post("/grocery-list/items", async (req, res): Promise<void> => {
  const parsed = AddGroceryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Prevent duplicates — return existing item if same name already in list
  const [existing] = await db
    .select()
    .from(groceryItemsTable)
    .where(ilike(groceryItemsTable.name, parsed.data.name));

  if (existing) {
    res.status(200).json({
      ...existing,
      unit: existing.unit ?? null,
      mealId: existing.mealId ?? null,
      mealName: existing.mealName ?? null,
    });
    return;
  }

  const [item] = await db
    .insert(groceryItemsTable)
    .values({
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit ?? null,
      category: parsed.data.category,
      isChecked: false,
      isCustom: true,
    })
    .returning();

  // If a schedule was specified, create a scheduled item
  if (parsed.data.scheduleType && parsed.data.scheduleType !== "none") {
    function intervalDays(type: string, custom?: number | null): number {
      switch (type) {
        case "weekly": return 7;
        case "biweekly": return 14;
        case "every_other_day": return 2;
        case "custom": return custom ?? 7;
        default: return 7;
      }
    }
    const days = intervalDays(parsed.data.scheduleType, parsed.data.scheduleDaysInterval);
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + days);
    await db.insert(scheduledItemsTable).values({
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit ?? null,
      category: parsed.data.category,
      scheduleType: parsed.data.scheduleType,
      scheduleDaysInterval: parsed.data.scheduleDaysInterval ?? null,
      nextDueDate: nextDue.toISOString().split("T")[0],
      isActive: true,
    });
  }

  res.status(201).json({
    ...item,
    unit: item.unit ?? null,
    mealId: item.mealId ?? null,
    mealName: item.mealName ?? null,
  });
});

router.patch("/grocery-list/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateGroceryItemParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateGroceryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.isChecked !== undefined && parsed.data.isChecked !== null) updateData.isChecked = parsed.data.isChecked;
  if (parsed.data.quantity !== undefined && parsed.data.quantity !== null) updateData.quantity = parsed.data.quantity;
  if (parsed.data.name !== undefined && parsed.data.name !== null) updateData.name = parsed.data.name;

  const [item] = await db
    .update(groceryItemsTable)
    .set(updateData)
    .where(eq(groceryItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Grocery item not found" });
    return;
  }

  res.json({
    ...item,
    unit: item.unit ?? null,
    mealId: item.mealId ?? null,
    mealName: item.mealName ?? null,
  });
});

router.delete("/grocery-list/items/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteGroceryItemParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(groceryItemsTable)
    .where(eq(groceryItemsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Grocery item not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/grocery-list/from-meal/:mealId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.mealId) ? req.params.mealId[0] : req.params.mealId;
  const params = AddMealToGroceryListParams.safeParse({ mealId: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, params.data.mealId));
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  const ingredients = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.mealId, params.data.mealId));

  const pantryItems = await db.select().from(pantryItemsTable).where(eq(pantryItemsTable.inStock, true));

  // Load existing grocery names once for dedup check
  const existingGrocery = await db.select({ name: groceryItemsTable.name }).from(groceryItemsTable);
  const existingNames = new Set(existingGrocery.map((g) => g.name.toLowerCase()));

  const addedItems: (typeof groceryItemsTable.$inferSelect)[] = [];
  const pantryPrompts: Array<{
    pantryItemId: number;
    ingredientName: string;
    question: string;
    groceryItemId: number;
  }> = [];

  for (const ingredient of ingredients) {
    // Skip if an item with the same name is already in the grocery list
    if (existingNames.has(ingredient.name.toLowerCase())) continue;

    const [inserted] = await db
      .insert(groceryItemsTable)
      .values({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        isChecked: false,
        isCustom: false,
        mealId: meal.id,
        mealName: meal.name,
      })
      .returning();

    addedItems.push(inserted);

    // Check if this ingredient is in pantry (pantry prompt for common pantry items)
    if (ingredient.isCommonPantryItem) {
      const pantryMatch = pantryItems.find(
        (p) =>
          p.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
          ingredient.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (pantryMatch) {
        pantryPrompts.push({
          pantryItemId: pantryMatch.id,
          ingredientName: ingredient.name,
          question: `Do you still have ${ingredient.name}?`,
          groceryItemId: inserted.id,
        });
      }
    }
  }

  // Record in history (skip if already saved under this name)
  const [existingHistory] = await db
    .select()
    .from(recipeHistoryTable)
    .where(ilike(recipeHistoryTable.name, meal.name))
    .limit(1);
  if (!existingHistory) {
    await db.insert(recipeHistoryTable).values({
      name: meal.name,
      cuisine: meal.cuisine,
      protein: meal.protein,
      isGlutenFree: meal.isGlutenFree,
      cookTimeMinutes: meal.cookTimeMinutes,
      calories: meal.calories,
      instructions: meal.instructions ?? null,
      sourceUrl: null,
      mealId: meal.id,
    });
  }

  res.json({
    addedItems: addedItems.map((i) => ({
      ...i,
      unit: i.unit ?? null,
      mealId: i.mealId ?? null,
      mealName: i.mealName ?? null,
    })),
    pantryPrompts,
  });
});

router.delete("/grocery-list/all", async (_req, res): Promise<void> => {
  const deleted = await db.delete(groceryItemsTable).returning();
  res.json({ deleted: deleted.length });
});

router.post("/grocery-list/clear", async (_req, res): Promise<void> => {
  await db.delete(groceryItemsTable).where(eq(groceryItemsTable.isChecked, true));
  res.json(await buildGroceryListResponse());
});

router.get("/grocery-list/suggestions", async (_req, res): Promise<void> => {
  // Suggest items based on common grocery purchases and pantry state
  const pantryItems = await db.select().from(pantryItemsTable);
  const depleted = pantryItems.filter((p) => !p.inStock);
  const currentGroceries = await db.select().from(groceryItemsTable);
  const currentNames = new Set(currentGroceries.map((g) => g.name.toLowerCase()));

  const suggestions: Array<{ name: string; reason: string; category: string; frequency: string }> = [];

  // Suggest depleted pantry items
  for (const item of depleted) {
    if (!currentNames.has(item.name.toLowerCase())) {
      suggestions.push({
        name: item.name,
        reason: "Marked as depleted in your pantry",
        category: item.category,
        frequency: "Based on pantry",
      });
    }
  }

  // Add common staples if not already in list
  const staples = [
    { name: "Eggs", category: "Dairy & Eggs", reason: "Common weekly staple" },
    { name: "Whole Milk", category: "Dairy & Eggs", reason: "Common weekly staple" },
    { name: "Bread", category: "Grains & Bread", reason: "Common weekly staple" },
    { name: "Olive Oil", category: "Pantry", reason: "Essential cooking ingredient" },
    { name: "Garlic", category: "Produce", reason: "Used in many recipes" },
    { name: "Onion", category: "Produce", reason: "Used in many recipes" },
    { name: "Lemons", category: "Produce", reason: "Common flavor enhancer" },
    { name: "Butter", category: "Dairy & Eggs", reason: "Common cooking staple" },
  ];

  for (const staple of staples) {
    if (!currentNames.has(staple.name.toLowerCase()) && suggestions.length < 10) {
      suggestions.push({ ...staple, frequency: "Weekly" });
    }
  }

  res.json(suggestions.slice(0, 8));
});

export default router;
