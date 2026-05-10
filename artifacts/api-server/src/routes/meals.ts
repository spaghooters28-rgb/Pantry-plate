import { Router, type IRouter } from "express";
import { eq, and, inArray, isNull, or } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable, userFavoritesTable } from "@workspace/db";
import {
  ListMealsQueryParams,
  GetMealParams,
  ToggleMealFavoriteParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth";
import { z } from "zod";

const CustomIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().default(""),
  unit: z.string().default(""),
  category: z.string().default("Other"),
});

const CreateCustomMealSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().optional().default(""),
  cuisine: z.string().optional().default("Other"),
  protein: z.string().optional().default("Other"),
  isGlutenFree: z.boolean().optional().default(false),
  cookTimeMinutes: z.number().int().min(0).optional().default(30),
  servings: z.number().int().min(1).optional().default(2),
  calories: z.number().int().min(0).optional().default(0),
  instructions: z.string().nullable().optional(),
  ingredients: z.array(CustomIngredientSchema).optional().default([]),
});

const router: IRouter = Router();

function buildMealResponseFromMaps(
  meal: typeof mealsTable.$inferSelect,
  ingredientMap: Map<number, (typeof ingredientsTable.$inferSelect)[]>,
  sidesMap: Map<number, (typeof sidesTable.$inferSelect)[]>,
  favoritedMealIds?: Set<number>,
) {
  return {
    ...meal,
    isFavorited: favoritedMealIds != null ? favoritedMealIds.has(meal.id) : false,
    imageUrl: meal.imageUrl ?? null,
    instructions: meal.instructions ?? null,
    ingredients: ingredientMap.get(meal.id) ?? [],
    availableSides: sidesMap.get(meal.id) ?? [],
  };
}

async function buildMealResponse(
  meal: typeof mealsTable.$inferSelect,
  favoritedMealIds?: Set<number>,
) {
  const [ingredients, sides] = await Promise.all([
    db.select().from(ingredientsTable).where(eq(ingredientsTable.mealId, meal.id)),
    db.select().from(sidesTable).where(eq(sidesTable.mealId, meal.id)),
  ]);
  return buildMealResponseFromMaps(
    meal,
    new Map([[meal.id, ingredients]]),
    new Map([[meal.id, sides]]),
    favoritedMealIds,
  );
}

/**
 * Returns a Drizzle condition that limits meal visibility to:
 * - Seeded/official meals (createdByUserId IS NULL), visible to everyone
 * - Meals created by the current authenticated user (createdByUserId = userId)
 * This prevents one user from seeing or being affected by another user's
 * AI-generated or imported recipes.
 */
function catalogVisibilityCondition(userId: number | undefined) {
  if (userId) {
    return or(isNull(mealsTable.createdByUserId), eq(mealsTable.createdByUserId, userId));
  }
  return isNull(mealsTable.createdByUserId);
}

router.get("/meals", async (req, res): Promise<void> => {
  const params = ListMealsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { cuisine, protein, glutenFree } = params.data;
  const userId = req.session?.userId as number | undefined;

  const conditions = [catalogVisibilityCondition(userId)!];
  if (cuisine) conditions.push(eq(mealsTable.cuisine, cuisine));
  if (protein) conditions.push(eq(mealsTable.protein, protein));
  if (glutenFree !== undefined) conditions.push(eq(mealsTable.isGlutenFree, glutenFree));

  const meals = await db.select().from(mealsTable).where(and(...conditions));

  if (meals.length === 0) {
    res.json([]);
    return;
  }

  const mealIds = meals.map((m) => m.id);

  const [allIngredients, allSides] = await Promise.all([
    db.select().from(ingredientsTable).where(inArray(ingredientsTable.mealId, mealIds)),
    db.select().from(sidesTable).where(inArray(sidesTable.mealId, mealIds)),
  ]);

  let favoritedIds: Set<number> = new Set();
  if (userId) {
    const favRows = await db
      .select({ mealId: userFavoritesTable.mealId })
      .from(userFavoritesTable)
      .where(eq(userFavoritesTable.userId, userId));
    favoritedIds = new Set(favRows.map((r) => r.mealId));
  }

  const ingredientMap = new Map<number, (typeof ingredientsTable.$inferSelect)[]>();
  for (const ing of allIngredients) {
    const list = ingredientMap.get(ing.mealId) ?? [];
    list.push(ing);
    ingredientMap.set(ing.mealId, list);
  }

  const sidesMap = new Map<number, (typeof sidesTable.$inferSelect)[]>();
  for (const side of allSides) {
    const list = sidesMap.get(side.mealId) ?? [];
    list.push(side);
    sidesMap.set(side.mealId, list);
  }

  res.json(meals.map((m) => buildMealResponseFromMaps(m, ingredientMap, sidesMap, favoritedIds)));
});

const CUISINES = [
  "American",
  "Asian",
  "BBQ & Grilled",
  "Breakfast",
  "Caribbean",
  "Chinese",
  "Desserts",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Side Dishes",
  "Thai",
  "Other",
];

const PROTEINS = [
  "Beef",
  "Chicken",
  "Duck",
  "Eggs",
  "Fish",
  "Lamb",
  "Pork",
  "Salmon",
  "Sausage",
  "Shrimp",
  "Steak",
  "Tofu",
  "Turkey",
  "Vegetarian",
  "Other",
];

router.get("/meals/cuisines", async (req, res): Promise<void> => {
  const userId = req.session?.userId as number | undefined;
  const dbRows = await db
    .selectDistinct({ cuisine: mealsTable.cuisine })
    .from(mealsTable)
    .where(catalogVisibilityCondition(userId));
  const dbValues = dbRows.map((m) => m.cuisine).filter((c) => !CUISINES.includes(c));
  res.json([...CUISINES, ...dbValues]);
});

router.get("/meals/proteins", async (req, res): Promise<void> => {
  const userId = req.session?.userId as number | undefined;
  const dbRows = await db
    .selectDistinct({ protein: mealsTable.protein })
    .from(mealsTable)
    .where(catalogVisibilityCondition(userId));
  const dbValues = dbRows.map((m) => m.protein).filter((p) => !PROTEINS.includes(p));
  res.json([...PROTEINS, ...dbValues]);
});

router.get("/meals/sides", async (req, res): Promise<void> => {
  const userId = req.session?.userId as number | undefined;
  const visibleMeals = await db
    .select({ id: mealsTable.id })
    .from(mealsTable)
    .where(catalogVisibilityCondition(userId));
  const visibleMealIds = visibleMeals.map((m) => m.id);
  if (visibleMealIds.length === 0) {
    res.json([]);
    return;
  }
  const allSides = await db
    .selectDistinct({ name: sidesTable.name })
    .from(sidesTable)
    .where(inArray(sidesTable.mealId, visibleMealIds));
  res.json(allSides.map((s) => s.name));
});

router.post("/meals/:id/toggle-favorite", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ToggleMealFavoriteParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.session.userId as number;
  const mealId = params.data.id;

  // Only allow favoriting meals visible to this user
  const [meal] = await db
    .select()
    .from(mealsTable)
    .where(and(eq(mealsTable.id, mealId), catalogVisibilityCondition(userId)!));
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(userFavoritesTable)
    .where(and(eq(userFavoritesTable.userId, userId), eq(userFavoritesTable.mealId, mealId)));

  if (existing) {
    await db
      .delete(userFavoritesTable)
      .where(and(eq(userFavoritesTable.userId, userId), eq(userFavoritesTable.mealId, mealId)));
  } else {
    await db.insert(userFavoritesTable).values({ userId, mealId });
  }

  const favoritedIds = new Set(existing ? [] : [mealId]);
  res.json(await buildMealResponse(meal, favoritedIds));
});

router.post("/meals/custom", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId as number;
  const parsed = CreateCustomMealSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { ingredients, instructions, ...mealFields } = parsed.data;
  const [meal] = await db
    .insert(mealsTable)
    .values({
      ...mealFields,
      instructions: instructions ?? null,
      createdByUserId: userId,
    })
    .returning();
  if (ingredients.length > 0) {
    await db.insert(ingredientsTable).values(
      ingredients.map((ing) => ({
        mealId: meal.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        isCommonPantryItem: false,
      }))
    );
  }
  res.status(201).json(await buildMealResponse(meal, new Set()));
});

router.get("/meals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetMealParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.session?.userId as number | undefined;

  // Only return the meal if it is visible to the requesting user
  const [meal] = await db
    .select()
    .from(mealsTable)
    .where(and(eq(mealsTable.id, params.data.id), catalogVisibilityCondition(userId)!));
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  let favoritedIds: Set<number> = new Set();
  if (userId) {
    const favRows = await db
      .select({ mealId: userFavoritesTable.mealId })
      .from(userFavoritesTable)
      .where(and(eq(userFavoritesTable.userId, userId), eq(userFavoritesTable.mealId, params.data.id)));
    favoritedIds = new Set(favRows.map((r) => r.mealId));
  }

  res.json(await buildMealResponse(meal, favoritedIds));
});

export default router;
