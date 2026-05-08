import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";
import {
  ListMealsQueryParams,
  GetMealParams,
  ToggleMealFavoriteParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildMealResponse(meal: typeof mealsTable.$inferSelect) {
  const ingredients = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.mealId, meal.id));

  const sides = await db
    .select()
    .from(sidesTable)
    .where(eq(sidesTable.mealId, meal.id));

  return {
    ...meal,
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

  const mealsWithDetails = await Promise.all(meals.map(buildMealResponse));
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
  // Return static curated list; merge any DB values not in the list
  const dbRows = await db.selectDistinct({ cuisine: mealsTable.cuisine }).from(mealsTable);
  const dbValues = dbRows.map((m) => m.cuisine).filter((c) => !CUISINES.includes(c));
  res.json([...CUISINES, ...dbValues]);
});

router.get("/meals/proteins", async (_req, res): Promise<void> => {
  // Return static curated list; merge any DB values not in the list
  const dbRows = await db.selectDistinct({ protein: mealsTable.protein }).from(mealsTable);
  const dbValues = dbRows.map((m) => m.protein).filter((p) => !PROTEINS.includes(p));
  res.json([...PROTEINS, ...dbValues]);
});

router.get("/meals/sides", async (_req, res): Promise<void> => {
  const allSides = await db.selectDistinct({ name: sidesTable.name }).from(sidesTable);
  res.json(allSides.map((s) => s.name));
});

router.post("/meals/:id/toggle-favorite", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ToggleMealFavoriteParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, params.data.id));
  if (!meal) {
    res.status(404).json({ error: "Meal not found" });
    return;
  }

  const [updated] = await db
    .update(mealsTable)
    .set({ isFavorited: !meal.isFavorited })
    .where(eq(mealsTable.id, params.data.id))
    .returning();

  res.json(await buildMealResponse(updated));
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

  res.json(await buildMealResponse(meal));
});

export default router;
