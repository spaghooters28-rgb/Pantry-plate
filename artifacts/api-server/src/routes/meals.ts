import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable, userFavoritesTable } from "@workspace/db";
import {
  ListMealsQueryParams,
  GetMealParams,
  ToggleMealFavoriteParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

async function buildMealResponse(
  meal: typeof mealsTable.$inferSelect,
  favoritedMealIds?: Set<number>,
) {
  const ingredients = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.mealId, meal.id));

  const sides = await db
    .select()
    .from(sidesTable)
    .where(eq(sidesTable.mealId, meal.id));

  const isFavorited = favoritedMealIds != null
    ? favoritedMealIds.has(meal.id)
    : false;

  return {
    ...meal,
    isFavorited,
    imageUrl: meal.imageUrl ?? null,
    instructions: meal.instructions ?? null,
    ingredients,
    availableSides: sides,
  };
}

router.get("/meals", async (req, res): Promise<void> => {
  const params = ListMealsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { cuisine, protein, glutenFree } = params.data;

  const conditions = [];
  if (cuisine) conditions.push(eq(mealsTable.cuisine, cuisine));
  if (protein) conditions.push(eq(mealsTable.protein, protein));
  if (glutenFree !== undefined) conditions.push(eq(mealsTable.isGlutenFree, glutenFree));

  const meals = conditions.length > 0
    ? await db.select().from(mealsTable).where(and(...conditions))
    : await db.select().from(mealsTable);

  const userId = req.session?.userId as number | undefined;
  let favoritedIds: Set<number> = new Set();
  if (userId) {
    const favRows = await db
      .select({ mealId: userFavoritesTable.mealId })
      .from(userFavoritesTable)
      .where(eq(userFavoritesTable.userId, userId));
    favoritedIds = new Set(favRows.map((r) => r.mealId));
  }

  const mealsWithDetails = await Promise.all(meals.map((m) => buildMealResponse(m, favoritedIds)));
  res.json(mealsWithDetails);
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

router.get("/meals/cuisines", async (_req, res): Promise<void> => {
  const dbRows = await db.selectDistinct({ cuisine: mealsTable.cuisine }).from(mealsTable);
  const dbValues = dbRows.map((m) => m.cuisine).filter((c) => !CUISINES.includes(c));
  res.json([...CUISINES, ...dbValues]);
});

router.get("/meals/proteins", async (_req, res): Promise<void> => {
  const dbRows = await db.selectDistinct({ protein: mealsTable.protein }).from(mealsTable);
  const dbValues = dbRows.map((m) => m.protein).filter((p) => !PROTEINS.includes(p));
  res.json([...PROTEINS, ...dbValues]);
});

router.get("/meals/sides", async (_req, res): Promise<void> => {
  const allSides = await db.selectDistinct({ name: sidesTable.name }).from(sidesTable);
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

  const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, mealId));
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

router.get("/meals/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetMealParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, params.data.id));
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  const userId = req.session?.userId as number | undefined;
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
