import { Router, type IRouter } from "express";
import { eq, desc, ilike, and, isNull, or } from "drizzle-orm";
import { db, pantryItemsTable, mealsTable, ingredientsTable, recipeHistoryTable, weeklyPlansTable, weeklyPlanDaysTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";
import { createUserRateLimit, createIpRateLimit } from "../middleware/rateLimit";
import { checkAndIncrementAiUsage } from "../lib/aiUsage";
import { geminiGenerate, isGeminiEnabled } from "../lib/gemini";
import dns from "dns";
import net from "net";
import https from "https";
import http from "http";
import type { IncomingMessage } from "http";

const router: IRouter = Router();

const analyzeRateLimit = createUserRateLimit(10, 60 * 60 * 1000);
const analyzeIpRateLimit = createIpRateLimit(20, 60 * 60 * 1000);

interface ExtractedIngredient {
  name: string;
  quantity: string;
  unit: string | null;
  category: string;
}

const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^metadata\.google\.internal$/i,
];

function isPrivateIpv4(addr: string): boolean {
  const parts = addr.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return false;
  const [a, b] = parts;
  return (
    a === 127 ||
    a === 10 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function isPrivateIpv6(addr: string): boolean {
  const lower = addr.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIpv4(mapped[1]);
  return false;
}

function isPrivateAddress(addr: string): boolean {
  if (net.isIPv4(addr)) return isPrivateIpv4(addr);
  if (net.isIPv6(addr)) return isPrivateIpv6(addr);
  return false;
}

async function resolveAndValidateUrl(rawUrl: string): Promise<{ parsed: URL; pinnedIp: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are allowed");
  }

  const hostname = parsed.hostname.toLowerCase();

  for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
    if (pattern.test(hostname)) throw new Error("Disallowed hostname");
  }

  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error("IP address is in a private range");
    return { parsed, pinnedIp: hostname };
  }

  let addresses: dns.LookupAddress[];
  try {
    addresses = await dns.promises.lookup(hostname, { all: true });
  } catch {
    throw new Error("DNS resolution failed");
  }

  if (addresses.length === 0) {
    throw new Error("DNS resolution returned no addresses");
  }

  for (const { address } of addresses) {
    if (isPrivateAddress(address)) throw new Error("Hostname resolves to a private address");
  }

  return { parsed, pinnedIp: addresses[0].address };
}

function fetchWithPinnedIp(parsed: URL, pinnedIp: string): Promise<{ ok: boolean; status: number; text: () => Promise<string> }> {
  const isHttps = parsed.protocol === "https:";
  const port = parsed.port ? parseInt(parsed.port, 10) : (isHttps ? 443 : 80);
  const path = parsed.pathname + parsed.search;
  const hostname = parsed.hostname;
  const hostHeader = parsed.port ? `${hostname}:${parsed.port}` : hostname;

  return new Promise((resolve, reject) => {
    const options = {
      host: pinnedIp,
      port,
      path,
      method: "GET",
      headers: {
        "Host": hostHeader,
        "User-Agent": "Mozilla/5.0 (compatible; PantryPlateBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      servername: hostname,
      timeout: 10000,
    };

    const req = (isHttps ? https : http).request(options, (res: IncomingMessage) => {
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400) {
        req.destroy();
        reject(new Error("Redirects are not allowed"));
        return;
      }

      resolve({
        ok: status >= 200 && status < 300,
        status,
        text: () =>
          new Promise<string>((textResolve, textReject) => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", (chunk: string) => { data += chunk; });
            res.on("end", () => { textResolve(data); });
            res.on("error", textReject);
          }),
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });

    req.end();
  });
}

router.post("/meals/analyze-recipe", requireAuth, analyzeIpRateLimit, analyzeRateLimit, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

  const { url } = req.body as { url?: string };

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "url is required" });
    return;
  }

  let parsed: URL;
  let pinnedIp: string;
  try {
    ({ parsed, pinnedIp } = await resolveAndValidateUrl(url));
  } catch {
    res.status(400).json({ error: "Invalid or disallowed URL" });
    return;
  }

  // Monthly AI cap check — after URL validation so invalid requests don't consume quota
  const usage = await checkAndIncrementAiUsage(userId);
  if (!usage.allowed) {
    res.status(429).json({
      error: `Monthly AI limit reached (${usage.cap} requests/month). Resets next month.`,
      used: usage.used,
      limit: usage.cap,
      cap: true,
    });
    return;
  }

  let pageContent = "";
  try {
    const response = await fetchWithPinnedIp(parsed, pinnedIp);
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

  const prompt = `You are a recipe parsing expert. Extract the recipe details, ingredients, and step-by-step instructions from the following web page content.

Page content:
${pageContent}

Return a JSON object (no markdown, no code fences, ONLY valid JSON) with this shape:
{
  "recipeName": "string (the recipe name)",
  "cuisine": "string (one of: American, Mexican, Asian, Indian, Italian, Mediterranean, Other)",
  "protein": "string (primary protein: Chicken, Beef, Pork, Fish, Shrimp, Tofu, Vegetarian, Mixed, Other)",
  "isGlutenFree": "boolean (true if the recipe is gluten-free)",
  "cookTimeMinutes": "number (total cook + prep time in minutes)",
  "calories": "number (estimated calories per serving)",
  "servings": "number (number of servings)",
  "instructions": "string or null (numbered step-by-step cooking instructions, written clearly. Null if not found.)",
  "ingredients": [
    {
      "name": "string (ingredient name, cleaned up, e.g. 'chicken breast')",
      "quantity": "string (amount, e.g. '2', '1/2', '200')",
      "unit": "string or null (e.g. 'cup', 'tbsp', 'g', 'oz', or null if unitless)",
      "category": "string (one of: Produce, Meat & Seafood, Dairy & Eggs, Grains & Bread, Bakery, Canned Goods, Condiments & Sauces, Snacks, Desserts, Beverages, Frozen, Pantry, Other)"
    }
  ]
}

Rules:
- Extract ALL ingredients listed in the recipe
- Extract the full step-by-step cooking instructions (numbered steps preferred)
- Clean up ingredient names (remove parenthetical notes, trim whitespace)
- Estimate calories per serving if not explicitly stated
- If you cannot find a recipe or ingredients, return { "recipeName": "Unknown Recipe", "cuisine": "Other", "protein": "Other", "isGlutenFree": false, "cookTimeMinutes": 30, "calories": 400, "servings": 4, "instructions": null, "ingredients": [] }
- Return ONLY the JSON object, nothing else`;

  let recipeName = "Unknown Recipe";
  let cuisine: string | null = null;
  let protein: string | null = null;
  let isGlutenFree: boolean | null = null;
  let cookTimeMinutes: number | null = null;
  let calories: number | null = null;
  let servings: number | null = null;
  let instructions: string | null = null;
  let extracted: ExtractedIngredient[] = [];

  if (!isGeminiEnabled()) {
    res.status(503).json({ error: "Recipe analysis is not configured. Set the GEMINI_API_KEY environment variable to enable it." });
    return;
  }

  try {
    const content = await geminiGenerate(prompt);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]) as {
        recipeName: string;
        cuisine?: string | null;
        protein?: string | null;
        isGlutenFree?: boolean | null;
        cookTimeMinutes?: number | null;
        calories?: number | null;
        servings?: number | null;
        instructions?: string | null;
        ingredients: ExtractedIngredient[];
      };
      recipeName = parsedResult.recipeName || "Unknown Recipe";
      cuisine = parsedResult.cuisine ?? null;
      protein = parsedResult.protein ?? null;
      isGlutenFree = parsedResult.isGlutenFree ?? null;
      cookTimeMinutes = typeof parsedResult.cookTimeMinutes === "number" ? parsedResult.cookTimeMinutes : null;
      calories = typeof parsedResult.calories === "number" ? parsedResult.calories : null;
      servings = typeof parsedResult.servings === "number" ? parsedResult.servings : null;
      instructions = parsedResult.instructions ?? null;
      extracted = Array.isArray(parsedResult.ingredients) ? parsedResult.ingredients : [];
    }
  } catch (err) {
    req.log.error({ err }, "AI recipe analysis failed");
    const errMsg = err instanceof Error ? err.message : "";
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
      res.status(503).json({ error: "AI service is temporarily rate-limited. Please wait a moment and try again." });
    } else if (errMsg.includes("not found") || errMsg.includes("503")) {
      res.status(503).json({ error: "AI service is unavailable. Please check that your Gemini API key is valid." });
    } else {
      res.status(500).json({ error: "Failed to analyze recipe with AI. Please try again." });
    }
    return;
  }

  const pantryItems = await db.select().from(pantryItemsTable).where(and(eq(pantryItemsTable.userId, userId), eq(pantryItemsTable.inStock, true)));

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

  res.json({ recipeName, cuisine, protein, isGlutenFree, cookTimeMinutes, calories, servings, instructions, ingredients, haveCount, needCount });
});

const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

router.post("/meals/save-recipe", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;

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

  const [existingMeal] = await db
    .select()
    .from(mealsTable)
    .where(
      and(
        ilike(mealsTable.name, body.recipeName),
        or(isNull(mealsTable.createdByUserId), eq(mealsTable.createdByUserId, userId))
      )
    )
    .limit(1);

  const meal = existingMeal ?? (await db.insert(mealsTable).values({
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
    createdByUserId: userId,
  }).returning())[0];

  if (!existingMeal && Array.isArray(body.ingredients) && body.ingredients.length > 0) {
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

  const [existingHistory] = await db
    .select()
    .from(recipeHistoryTable)
    .where(
      and(
        ilike(recipeHistoryTable.name, body.recipeName),
        eq(recipeHistoryTable.userId, userId)
      )
    )
    .limit(1);
  if (!existingHistory) {
    await db.insert(recipeHistoryTable).values({
      userId,
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
  }

  if (body.assignToDay && ALL_DAYS.includes(body.assignToDay)) {
    let plan = (
      await db
        .select()
        .from(weeklyPlansTable)
        .where(eq(weeklyPlansTable.userId, userId))
        .orderBy(desc(weeklyPlansTable.id))
        .limit(1)
    )[0];

    if (!plan) {
      [plan] = await db
        .insert(weeklyPlansTable)
        .values({ userId, weekStartDate: getWeekStart() })
        .returning();
      await db.insert(weeklyPlanDaysTable).values(
        ALL_DAYS.map((day) => ({ planId: plan.id, day, mealId: null as number | null, selectedSideId: null as number | null }))
      );
    }

    const dayRows = await db.select().from(weeklyPlanDaysTable).where(eq(weeklyPlanDaysTable.planId, plan.id));
    const dayRow = dayRows.find((d) => d.day === body.assignToDay);

    if (dayRow) {
      await db.update(weeklyPlanDaysTable).set({ mealId: meal.id }).where(eq(weeklyPlanDaysTable.id, dayRow.id));
    } else {
      await db.insert(weeklyPlanDaysTable).values({ planId: plan.id, day: body.assignToDay!, mealId: meal.id, selectedSideId: null });
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
