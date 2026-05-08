import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, pantryItemsTable, mealsTable, ingredientsTable, recipeHistoryTable, weeklyPlansTable, weeklyPlanDaysTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

interface ExtractedIngredient {
  name: string;
  quantity: string;
  unit: string | null;
  category: string;
}

router.post("/meals/analyze-recipe", async (req, res): Promise<void> => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }

  let pageContent = "";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PantryPlateBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      res.status(400).json({ error: `Could not fetch URL (HTTP ${response.status})` });
      return;
    }
    const html = await response.text();
    pageContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 14000);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch recipe URL");
    res.status(400).json({ error: "Could not fetch the recipe URL. Make sure it is publicly accessible." });
    return;
  }

  const prompt = `You are a recipe parsing expert. Extract the recipe name, ingredients, and step-by-step instructions from the following web page content.

Page content:
${pageContent}

Return a JSON object (no markdown, no code fences, ONLY valid JSON) with this shape:
{
  "recipeName": "string (the recipe name)",
  "instructions": "string or null (numbered step-by-step cooking instructions, written clearly. Null if not found.)",
  "ingredients": [
    {
      "name": "string (ingredient name, cleaned up, e.g. 'chicken breast')",
      "quantity": "string (amount, e.g. '2', '1/2', '200')",
      "unit": "string or null (e.g. 'cup', 'tbsp', 'g', 'oz', or null if unitless)",
      "category": "string (one of: Produce, Dairy & Eggs, Meat & Seafood, Pantry, Spices & Herbs, Grains & Bread, Frozen, Beverages, Other)"
    }
  ]
}

Rules:
- Extract ALL ingredients listed in the recipe
- Extract the full step-by-step cooking instructions (numbered steps preferred)
- Clean up ingredient names (remove parenthetical notes, trim whitespace)
- If you cannot find a recipe or ingredients, return { "recipeName": "Unknown Recipe", "instructions": null, "ingredients": [] }
- Return ONLY the JSON object, nothing else`;

  let recipeName = "Unknown Recipe";
  let instructions: string | null = null;
  let extracted: ExtractedIngredient[] = [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { recipeName: string; instructions?: string | null; ingredients: ExtractedIngredient[] };
      recipeName = parsed.recipeName || "Unknown Recipe";
      instructions = parsed.instructions ?? null;
      extracted = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    }
  } catch (err) {
    req.log.error({ err }, "AI recipe analysis failed");
    res.status(500).json({ error: "Failed to analyze recipe with AI" });
    return;
  }

  const pantryItems = await db.select().from(pantryItemsTable).where(eq(pantryItemsTable.inStock, true));

  const ingredients = extracted.map((ing) => {
    const inPantry = pantryItems.some(
      (p) =>
        p.name.toLowerCase().includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(p.name.toLowerCase())
    );
    return {
      name: ing.name,
      quantity: ing.quantity || "1",
      unit: ing.unit ?? null,
      category: ing.category || "Other",
      inPantry,
    };
  });

  const haveCount = ingredients.filter((i) => i.inPantry).length;
  const needCount = ingredients.filter((i) => !i.inPantry).length;

  res.json({ recipeName, instructions, ingredients, haveCount, needCount });
});

const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

router.post("/meals/save-recipe", async (req, res): Promise<void> => {
  const body = req.body as {
    recipeName?: string;
    cuisine?: string | null;
    protein?: string | null;
    isGlutenFree?: boolean | null;
    cookTimeMinutes?: number | null;
    calories?: number | null;
    instructions?: string | null;
    sourceUrl?: string | null;
    assignToDay?: string | null;
    ingredients?: Array<{ name: string; quantity: string; unit?: string | null; category: string; inPantry?: boolean }>;
  };

  if (!body.recipeName || typeof body.recipeName !== "string") {
    res.status(400).json({ error: "recipeName is required" });
    return;
  }

  const cuisine = body.cuisine || "Other";
  const protein = body.protein || "Mixed";
  const isGlutenFree = body.isGlutenFree ?? false;
  const cookTimeMinutes = body.cookTimeMinutes ?? 30;
  const calories = body.calories ?? 400;
  const instructions = body.instructions ?? null;
  const sourceUrl = body.sourceUrl ?? null;

  const [meal] = await db.insert(mealsTable).values({
    name: body.recipeName,
    description: `Recipe imported from ${sourceUrl ?? "external source"}`,
    cuisine,
    protein,
    isGlutenFree,
    cookTimeMinutes,
    calories,
    servings: 4,
    tags: [],
    isFavorited: false,
    instructions,
    imageUrl: null,
  }).returning();

  if (Array.isArray(body.ingredients) && body.ingredients.length > 0) {
    await db.insert(ingredientsTable).values(
      body.ingredients.map((ing) => ({
        mealId: meal.id,
        name: ing.name,
        quantity: ing.quantity || "1",
        unit: ing.unit || "",
        category: ing.category || "Other",
        isCommonPantryItem: false,
      }))
    );
  }

  await db.insert(recipeHistoryTable).values({
    name: body.recipeName,
    cuisine,
    protein,
    isGlutenFree,
    cookTimeMinutes,
    calories,
    instructions,
    sourceUrl,
    mealId: meal.id,
  });

  if (body.assignToDay && ALL_DAYS.includes(body.assignToDay)) {
    const [plan] = await db.select().from(weeklyPlansTable).orderBy(desc(weeklyPlansTable.id)).limit(1);
    if (plan) {
      const dayRows = await db.select().from(weeklyPlanDaysTable).where(eq(weeklyPlanDaysTable.planId, plan.id));
      const dayRow = dayRows.find((d) => d.day === body.assignToDay);
      if (dayRow) {
        await db.update(weeklyPlanDaysTable).set({ mealId: meal.id }).where(eq(weeklyPlanDaysTable.id, dayRow.id));
      }
    }
  }

  const savedIngredients = await db.select().from(ingredientsTable).where(eq(ingredientsTable.mealId, meal.id));

  res.status(201).json({
    ...meal,
    imageUrl: meal.imageUrl ?? null,
    instructions: meal.instructions ?? null,
    ingredients: savedIngredients,
    availableSides: [],
  });
});

export default router;
