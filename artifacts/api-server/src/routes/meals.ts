import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";
import {
  ListMealsQueryParams,
  GetMealParams,
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

router.get("/meals/cuisines", async (_req, res): Promise<void> => {
  const meals = await db.selectDistinct({ cuisine: mealsTable.cuisine }).from(mealsTable);
  res.json(meals.map((m) => m.cuisine));
});

router.get("/meals/proteins", async (_req, res): Promise<void> => {
  const meals = await db.selectDistinct({ protein: mealsTable.protein }).from(mealsTable);
  res.json(meals.map((m) => m.protein));
});

router.get("/meals/sides", async (_req, res): Promise<void> => {
  const allSides = await db.selectDistinct({ name: sidesTable.name }).from(sidesTable);
  res.json(allSides.map((s) => s.name));
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
