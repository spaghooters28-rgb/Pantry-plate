import { Router, type IRouter } from "express";
import { eq, desc, ilike } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable, weeklyPlansTable, weeklyPlanDaysTable, groceryItemsTable, pantryItemsTable, recipeHistoryTable } from "@workspace/db";
import { GenerateWeeklyPlanBody, UpdateDayMealBody, UpdateDayMealParams } from "@workspace/api-zod";

const router: IRouter = Router();

const ALL_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

async function getMealDetails(mealId: number | null | undefined) {
  if (!mealId) return null;
  const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, mealId));
  if (!meal) return null;
  const ingredients = await db.select().from(ingredientsTable).where(eq(ingredientsTable.mealId, mealId));
  const sides = await db.select().from(sidesTable).where(eq(sidesTable.mealId, mealId));
  return { ...meal, imageUrl: meal.imageUrl ?? null, instructions: meal.instructions ?? null, ingredients, availableSides: sides };
}

async function buildPlanResponse(plan: typeof weeklyPlansTable.$inferSelect) {
  const planDays = await db
    .select()
    .from(weeklyPlanDaysTable)
    .where(eq(weeklyPlanDaysTable.planId, plan.id));

  const daysWithMeals = await Promise.all(
    planDays.map(async (d) => ({
      day: d.day,
      meal: await getMealDetails(d.mealId),
      selectedSideId: d.selectedSideId ?? null,
    }))
  );

  // Sort by ALL_DAYS order so response is always Sunday-first
  daysWithMeals.sort((a, b) => ALL_DAYS.indexOf(a.day) - ALL_DAYS.indexOf(b.day));

  return {
    id: plan.id,
    weekStartDate: plan.weekStartDate,
    generatedAt: plan.generatedAt,
    days: daysWithMeals,
  };
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

router.get("/weekly-plan", async (_req, res): Promise<void> => {
  const [plan] = await db
    .select()
    .from(weeklyPlansTable)
    .orderBy(desc(weeklyPlansTable.id))
    .limit(1);

  if (!plan) {
    const weekStart = getWeekStart();
    res.json({
      id: 0,
      weekStartDate: weekStart,
      generatedAt: new Date().toISOString(),
      days: ALL_DAYS.map((day) => ({ day, meal: null, selectedSideId: null })),
    });
    return;
  }

  res.json(await buildPlanResponse(plan));
});

router.post("/weekly-plan", async (req, res): Promise<void> => {
  const parsed = GenerateWeeklyPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { cuisine, glutenFree, proteins } = parsed.data;

  let allMeals = await db.select().from(mealsTable);
  if (cuisine) allMeals = allMeals.filter((m) => m.cuisine === cuisine);
  if (glutenFree) allMeals = allMeals.filter((m) => m.isGlutenFree === true);
  if (proteins && proteins.length > 0) allMeals = allMeals.filter((m) => proteins.includes(m.protein));

  const shuffled = [...allMeals].sort(() => Math.random() - 0.5);

  // Support activeDays from body (not in GenerateWeeklyPlanBody schema yet, read raw)
  const rawBody = req.body as Record<string, unknown>;
  const activeDays: string[] = Array.isArray(rawBody.activeDays) && (rawBody.activeDays as unknown[]).every((d) => typeof d === "string")
    ? (rawBody.activeDays as string[]).filter((d) => ALL_DAYS.includes(d))
    : ALL_DAYS;

  const planDays = activeDays.length > 0 ? activeDays : ALL_DAYS;
  const selected = shuffled.slice(0, planDays.length);

  const weekStart = getWeekStart();

  const [newPlan] = await db
    .insert(weeklyPlansTable)
    .values({ weekStartDate: weekStart })
    .returning();

  // Build all 7 days — active days get meals, inactive days get null
  await db.insert(weeklyPlanDaysTable).values(
    ALL_DAYS.map((day, i) => {
      const activeIndex = planDays.indexOf(day);
      return {
        planId: newPlan.id,
        day,
        mealId: activeIndex >= 0 ? (selected[activeIndex]?.id ?? null) : null,
        selectedSideId: null,
      };
    })
  );

  res.json(await buildPlanResponse(newPlan));
});

router.post("/weekly-plan/add-to-grocery", async (_req, res): Promise<void> => {
  const [plan] = await db
    .select()
    .from(weeklyPlansTable)
    .orderBy(desc(weeklyPlansTable.id))
    .limit(1);

  if (!plan) {
    res.status(404).json({ error: "No weekly plan exists yet" });
    return;
  }

  const planDays = await db
    .select()
    .from(weeklyPlanDaysTable)
    .where(eq(weeklyPlanDaysTable.planId, plan.id));

  const mealIds = [...new Set(planDays.map((d) => d.mealId).filter((id): id is number => id !== null))];

  if (mealIds.length === 0) {
    res.json({ added: 0, mealsProcessed: 0 });
    return;
  }

  const pantryItems = await db.select().from(pantryItemsTable).where(eq(pantryItemsTable.inStock, true));

  let totalAdded = 0;

  for (const mealId of mealIds) {
    const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, mealId));
    if (!meal) continue;

    const ingredients = await db
      .select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.mealId, mealId));

    for (const ingredient of ingredients) {
      // Skip if already in grocery list for this meal
      const existing = await db
        .select()
        .from(groceryItemsTable)
        .where(eq(groceryItemsTable.name, ingredient.name));

      if (existing.some((e) => e.mealId === mealId)) continue;

      // Skip common pantry items that are in stock
      if (ingredient.isCommonPantryItem) {
        const inPantry = pantryItems.find(
          (p) =>
            p.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
            ingredient.name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (inPantry) continue;
      }

      await db.insert(groceryItemsTable).values({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        isChecked: false,
        isCustom: false,
        mealId: meal.id,
        mealName: meal.name,
      });

      totalAdded++;
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
  }

  res.json({ added: totalAdded, mealsProcessed: mealIds.length });
});

router.put("/weekly-plan/days/:day/meal", async (req, res): Promise<void> => {
  const rawDay = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
  const params = UpdateDayMealParams.safeParse({ day: rawDay });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDayMealBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [plan] = await db
    .select()
    .from(weeklyPlansTable)
    .orderBy(desc(weeklyPlansTable.id))
    .limit(1);

  if (!plan) {
    res.status(404).json({ error: "No weekly plan exists yet" });
    return;
  }

  const dayRows = await db
    .select()
    .from(weeklyPlanDaysTable)
    .where(eq(weeklyPlanDaysTable.planId, plan.id));

  const dayRow = dayRows.find((d) => d.day === params.data.day);

  if (!dayRow) {
    res.status(404).json({ error: "Day not found in plan" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.mealId !== undefined) updateData.mealId = parsed.data.mealId;
  if (parsed.data.selectedSideId !== undefined) updateData.selectedSideId = parsed.data.selectedSideId;

  const [updated] = await db
    .update(weeklyPlanDaysTable)
    .set(updateData)
    .where(eq(weeklyPlanDaysTable.id, dayRow.id))
    .returning();

  res.json({
    day: updated.day,
    meal: await getMealDetails(updated.mealId),
    selectedSideId: updated.selectedSideId ?? null,
  });
});

export default router;
