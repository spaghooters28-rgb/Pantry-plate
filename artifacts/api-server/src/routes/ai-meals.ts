import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, mealsTable, ingredientsTable, sidesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";

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

router.post("/meals/generate-ai", async (req, res): Promise<void> => {
  const { cuisine, protein, glutenFree, count = 10 } = req.body ?? {};

  const cuisineFilter = typeof cuisine === "string" && cuisine ? cuisine : null;
  const proteinFilter = typeof protein === "string" && protein ? protein : null;
  const glutenFreeFilter = typeof glutenFree === "boolean" ? glutenFree : null;
  const mealCount = Math.min(Math.max(Number(count) || 10, 5), 20);

  const filterParts: string[] = [];
  if (cuisineFilter) filterParts.push(`cuisine: ${cuisineFilter}`);
  if (proteinFilter) filterParts.push(`protein: ${proteinFilter}`);
  if (glutenFreeFilter === true) filterParts.push("gluten-free only");
  const filterDesc = filterParts.length > 0 ? filterParts.join(", ") : "any cuisine and protein";

  const prompt = `You are a culinary expert. Generate exactly ${mealCount} diverse, creative, and delicious meal ideas with these constraints: ${filterDesc}.

Return a JSON array (no markdown, no code fences, ONLY valid JSON) with exactly ${mealCount} objects. Each object must have these exact fields:
- name: string (unique, creative meal name)
- description: string (2-3 sentences, appetizing)
- cuisine: string (one of: American, Mexican, Asian, Indian, Italian, Mediterranean)
- protein: string (one of: Chicken, Beef, Pork, Fish, Shrimp, Tofu, Vegetarian)
- isGlutenFree: boolean
- cookTimeMinutes: number (realistic, e.g. 20-180)
- servings: number (2, 4, or 6)
- calories: number (per serving, e.g. 250-800)
- tags: string[] (3-5 lowercase tags, e.g. ["spicy","quick","comfort-food"])
- instructions: string (numbered step-by-step cooking instructions, 6-10 steps, clear and practical — e.g. "1. Season the chicken...\n2. Heat oil in a pan...")
- ingredients: array of objects (6-12 items), each with:
    name: string, quantity: string, unit: string, category: string, isCommonPantryItem: boolean
    category must be one of: Produce, Dairy, Meat & Seafood, Pantry, Spices & Herbs, Bakery, Frozen, Beverages, Other
    isCommonPantryItem true for staples like olive oil, salt, garlic, butter, etc.
- sides: array of objects (2-3 items), each with: name: string, description: string

IMPORTANT:${glutenFreeFilter === true ? " ALL meals MUST be gluten-free." : ""}${cuisineFilter ? ` ALL meals MUST be ${cuisineFilter} cuisine.` : ""}${proteinFilter ? ` ALL meals MUST feature ${proteinFilter} as the primary protein.` : ""}
Be creative — avoid generic or duplicated meal names. Return ONLY the JSON array, nothing else.`;

  let suggestions: AiMealSuggestion[] = [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      res.status(500).json({ error: "AI returned unexpected format" });
      return;
    }
    suggestions = JSON.parse(jsonMatch[0]) as AiMealSuggestion[];
  } catch (err) {
    req.log.error({ err }, "AI meal generation failed");
    res.status(500).json({ error: "Failed to generate meal ideas" });
    return;
  }

  const savedMeals = [];

  for (const suggestion of suggestions) {
    try {
      const [meal] = await db
        .insert(mealsTable)
        .values({
          name: suggestion.name,
          description: suggestion.description,
          cuisine: suggestion.cuisine,
          protein: suggestion.protein,
          isGlutenFree: Boolean(suggestion.isGlutenFree),
          cookTimeMinutes: Number(suggestion.cookTimeMinutes) || 30,
          servings: Number(suggestion.servings) || 4,
          calories: Number(suggestion.calories) || 400,
          imageUrl: null,
          tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
          instructions: typeof suggestion.instructions === "string" && suggestion.instructions.trim()
            ? suggestion.instructions.trim()
            : null,
        })
        .returning();

      if (!meal) continue;

      if (Array.isArray(suggestion.ingredients) && suggestion.ingredients.length > 0) {
        await db.insert(ingredientsTable).values(
          suggestion.ingredients.map((ing) => ({
            mealId: meal.id,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit ?? "",
            category: ing.category ?? "Other",
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

      savedMeals.push({ ...meal, ingredients, availableSides: sides });
    } catch {
      // skip individual insert failures silently
    }
  }

  res.json(savedMeals);
});

export default router;
