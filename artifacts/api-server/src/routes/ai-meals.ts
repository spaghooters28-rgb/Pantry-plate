import { Router, type IRouter } from "express";
import { eq, and, isNull, or } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth } from "../middleware/requireAuth";
import { requireTier } from "../middleware/requireTier";
import { createUserRateLimit, createIpRateLimit } from "../middleware/rateLimit";
import { checkAndIncrementAiUsage } from "../lib/aiUsage";

const router: IRouter = Router();

interface AiMealSuggestion {
  name: string;
  description: string;
  cuisine: string;
  protein: string;
  isGlutenFree: boolean;
  cookTimeMinutes: number;
  servings: number;
  calories: number;
  tags: string[];
  instructions: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    category: string;
    isCommonPantryItem: boolean;
  }>;
  sides: Array<{
    name: string;
    description: string;
  }>;
}

function buildPrompt(
  cuisineFilter: string | null,
  proteinFilter: string | null,
  glutenFreeFilter: boolean | null,
  existingNames: string[]
): string {
  const cuisineVal = cuisineFilter ?? "any (pick one of: American, Asian, BBQ & Grilled, Breakfast, Caribbean, Chinese, Desserts, French, Greek, Indian, Italian, Japanese, Korean, Mediterranean, Mexican, Middle Eastern, Side Dishes, Thai, Other)";
  const proteinVal = proteinFilter ?? "any (pick one of: Beef, Chicken, Duck, Eggs, Fish, Lamb, Pork, Salmon, Sausage, Shrimp, Steak, Tofu, Turkey, Vegetarian, Other)";

  const avoidLine =
    existingNames.length > 0
      ? `\nDo NOT use any of these names (already exist): ${existingNames.slice(-20).join(", ")}.`
      : "";

  const gfLine = glutenFreeFilter === true ? "\nMUST be gluten-free (isGlutenFree: true)." : "";

  return `Create one creative ${cuisineFilter ?? "cuisine"} meal featuring ${proteinFilter ?? "protein"}.${gfLine}${avoidLine}

Fill every field with real, specific values. Return ONLY this JSON (no markdown, no extra text):
{
  "name": "unique creative meal name",
  "description": "1-2 appetizing sentences",
  "cuisine": "${cuisineFilter ?? "<chosen cuisine>"}",
  "protein": "${proteinFilter ?? "<chosen protein>"}",
  "isGlutenFree": false,
  "cookTimeMinutes": 35,
  "servings": 4,
  "calories": 480,
  "tags": ["tag1", "tag2", "tag3"],
  "instructions": "1. First step.\\n2. Second step.\\n3. Third step.\\n4. Fourth step.\\n5. Fifth step.",
  "ingredients": [
    {"name": "Main Ingredient", "quantity": "1", "unit": "lb", "category": "Meat & Seafood", "isCommonPantryItem": false},
    {"name": "Vegetable", "quantity": "2", "unit": "cups", "category": "Produce", "isCommonPantryItem": false},
    {"name": "Pantry Item", "quantity": "2", "unit": "tbsp", "category": "Condiments & Sauces", "isCommonPantryItem": true}
  ],
  "sides": [
    {"name": "Side name", "description": "Brief description"},
    {"name": "Second side", "description": "Brief description"}
  ]
}

Rules: cuisine MUST be ${cuisineVal}. protein MUST be ${proteinVal}. Use 5-10 ingredients total. Return ONLY valid JSON.`;
}

async function generateAndSaveMeal(
  cuisineFilter: string | null,
  proteinFilter: string | null,
  glutenFreeFilter: boolean | null,
  existingNames: string[],
  createdByUserId: number,
): Promise<object | null> {
  const prompt = buildPrompt(cuisineFilter, proteinFilter, glutenFreeFilter, existingNames);

  const response = await openai.chat.completions.create({
    model: "gpt-5-nano",
    max_completion_tokens: 16384,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content ?? "";
  if (!content) return null;

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  let suggestion: AiMealSuggestion;
  try {
    suggestion = JSON.parse(jsonMatch[0]) as AiMealSuggestion;
  } catch {
    return null;
  }

  if (!suggestion.name || existingNames.includes(suggestion.name)) return null;

  if (cuisineFilter && suggestion.cuisine !== cuisineFilter) {
    suggestion.cuisine = cuisineFilter;
  }
  if (proteinFilter && suggestion.protein !== proteinFilter) {
    suggestion.protein = proteinFilter;
  }

  const [meal] = await db
    .insert(mealsTable)
    .values({
      name: suggestion.name,
      description: suggestion.description ?? "",
      cuisine: suggestion.cuisine,
      protein: suggestion.protein,
      isGlutenFree: glutenFreeFilter === true ? true : Boolean(suggestion.isGlutenFree),
      cookTimeMinutes: Number(suggestion.cookTimeMinutes) || 30,
      servings: Number(suggestion.servings) || 4,
      calories: Number(suggestion.calories) || 400,
      imageUrl: null,
      tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
      instructions:
        typeof suggestion.instructions === "string" && suggestion.instructions.trim()
          ? suggestion.instructions.trim()
          : null,
      createdByUserId,
    })
    .returning();

  if (!meal) return null;

  if (Array.isArray(suggestion.ingredients) && suggestion.ingredients.length > 0) {
    await db.insert(ingredientsTable).values(
      suggestion.ingredients.map((ing) => ({
        mealId: meal.id,
        name: ing.name,
        quantity: String(ing.quantity ?? "1"),
        unit: String(ing.unit ?? ""),
        category: String(ing.category ?? "Other"),
        isCommonPantryItem: Boolean(ing.isCommonPantryItem),
      }))
    );
  }

  if (Array.isArray(suggestion.sides) && suggestion.sides.length > 0) {
    await db.insert(sidesTable).values(
      suggestion.sides.map((side) => ({
        mealId: meal.id,
        name: side.name,
        description: side.description ?? "",
      }))
    );
  }

  const ingredients = await db
    .select()
    .from(ingredientsTable)
    .where(eq(ingredientsTable.mealId, meal.id));

  const sides = await db
    .select()
    .from(sidesTable)
    .where(eq(sidesTable.mealId, meal.id));

  return { ...meal, ingredients, availableSides: sides };
}

const generateAiRateLimit = createUserRateLimit(5, 60 * 60 * 1000);
const generateAiIpRateLimit = createIpRateLimit(10, 60 * 60 * 1000);

router.post("/meals/generate-ai", requireAuth, requireTier("pro_ai"), generateAiIpRateLimit, generateAiRateLimit, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  // Monthly AI cap check
  const usage = await checkAndIncrementAiUsage(userId);
  if (!usage.allowed) {
    res.status(429).json({
      error: `Monthly AI limit reached (${usage.cap} requests/month). Resets next month.`,
      used: usage.used,
      cap: usage.cap,
    });
    return;
  }

  const { cuisine, protein, glutenFree, count = 5 } = req.body ?? {};

  const cuisineFilter = typeof cuisine === "string" && cuisine ? cuisine : null;
  const proteinFilter = typeof protein === "string" && protein ? protein : null;
  const glutenFreeFilter = typeof glutenFree === "boolean" ? glutenFree : null;
  const mealCount = Math.min(Math.max(Number(count) || 5, 1), 8);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const existingRows = await db
    .select({ name: mealsTable.name })
    .from(mealsTable)
    .where(or(isNull(mealsTable.createdByUserId), eq(mealsTable.createdByUserId, userId)));
  const existingNames = existingRows.map((r) => r.name);
  const generatedThisSession: string[] = [];

  let saved = 0;

  for (let i = 0; i < mealCount; i++) {
    try {
      const allKnownNames = [...existingNames, ...generatedThisSession];
      const meal = await generateAndSaveMeal(
        cuisineFilter,
        proteinFilter,
        glutenFreeFilter,
        allKnownNames,
        userId,
      );

      if (meal) {
        const mealName = (meal as { name: string }).name;
        generatedThisSession.push(mealName);
        saved++;
        res.write(`data: ${JSON.stringify({ type: "meal", meal })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ type: "skip" })}\n\n`);
      }
    } catch (err) {
      req.log.error({ err }, `AI meal generation failed for item ${i + 1}`);
      res.write(`data: ${JSON.stringify({ type: "error", message: "One meal failed, continuing…" })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ type: "done", count: saved })}\n\n`);
  res.end();
});

export default router;
