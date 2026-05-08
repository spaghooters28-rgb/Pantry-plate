import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, pantryItemsTable } from "@workspace/db";
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

  // Fetch the recipe page content
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
    // Strip HTML tags to get readable text; limit to 12000 chars
    pageContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch recipe URL");
    res.status(400).json({ error: "Could not fetch the recipe URL. Make sure it is publicly accessible." });
    return;
  }

  const prompt = `You are a recipe parsing expert. Extract the recipe name and all ingredients from the following web page content.

Page content:
${pageContent}

Return a JSON object (no markdown, no code fences, ONLY valid JSON) with this shape:
{
  "recipeName": "string (the recipe name)",
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
- Clean up ingredient names (remove parenthetical notes, trim whitespace)
- If you cannot find a recipe or ingredients, return { "recipeName": "Unknown Recipe", "ingredients": [] }
- Return ONLY the JSON object, nothing else`;

  let recipeName = "Unknown Recipe";
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
      const parsed = JSON.parse(jsonMatch[0]) as { recipeName: string; ingredients: ExtractedIngredient[] };
      recipeName = parsed.recipeName || "Unknown Recipe";
      extracted = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    }
  } catch (err) {
    req.log.error({ err }, "AI recipe analysis failed");
    res.status(500).json({ error: "Failed to analyze recipe with AI" });
    return;
  }

  // Cross-reference with pantry
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

  res.json({ recipeName, ingredients, haveCount, needCount });
});

export default router;
