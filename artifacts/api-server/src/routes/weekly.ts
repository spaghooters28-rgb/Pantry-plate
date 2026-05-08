import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable, weeklyPlansTable, weeklyPlanDaysTable } from "@workspace/db";
import { GenerateWeeklyPlanBody, UpdateDayMealBody, UpdateDayMealParams } from "@workspace/api-zod";

const router: IRouter = Router();

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

async function getMealDetails(mealId: number | null | undefined) {
  if (!mealId) return null;
  const [meal] = await db.select().from(mealsTable).where(eq(mealsTable.id, mealId));
  if (!meal) return null;
  const ingredients = await db.select().from(ingredientsTable).where(eq(ingredientsTable.mealId, mealId));
  const sides = await db.select().from(sidesTable).where(eq(sidesTable.mealId, mealId));
  return { ...meal, imageUrl: meal.imageUrl ?? null, ingredients, availableSides: sides };
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
      days: DAYS.map((day) => ({ day, meal: null, selectedSideId: null })),
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
  const selected = shuffled.slice(0, 7);

  const weekStart = getWeekStart();

  const [newPlan] = await db
    .insert(weeklyPlansTable)
    .values({ weekStartDate: weekStart })
    .returning();

  await db.insert(weeklyPlanDaysTable).values(
    DAYS.map((day, i) => ({
      planId: newPlan.id,
      day,
      mealId: selected[i]?.id ?? null,
      selectedSideId: null,
    }))
  );

  res.json(await buildPlanResponse(newPlan));
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
