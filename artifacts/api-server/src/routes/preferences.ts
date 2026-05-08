import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, preferencesTable } from "@workspace/db";

const router: IRouter = Router();

const WEEKLY_PLAN_KEY = "weekly-plan";

const DEFAULT_PREFS = {
  cuisine: null,
  proteins: [] as string[],
  glutenFree: null,
  activeDays: [] as string[],
};

async function getPrefs() {
  const [row] = await db
    .select()
    .from(preferencesTable)
    .where(eq(preferencesTable.key, WEEKLY_PLAN_KEY));

  if (!row) return DEFAULT_PREFS;

  try {
    return JSON.parse(row.value) as typeof DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

router.get("/preferences/weekly-plan", async (_req, res): Promise<void> => {
  res.json(await getPrefs());
});

router.put("/preferences/weekly-plan", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;

  const prefs = {
    cuisine: typeof body.cuisine === "string" ? body.cuisine : null,
    proteins: Array.isArray(body.proteins) ? (body.proteins as string[]).filter((p) => typeof p === "string") : [],
    glutenFree: typeof body.glutenFree === "boolean" ? body.glutenFree : null,
    activeDays: Array.isArray(body.activeDays) ? (body.activeDays as string[]).filter((d) => typeof d === "string") : [],
  };

  const value = JSON.stringify(prefs);

  const existing = await db
    .select()
    .from(preferencesTable)
    .where(eq(preferencesTable.key, WEEKLY_PLAN_KEY));

  if (existing.length > 0) {
    await db
      .update(preferencesTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(preferencesTable.key, WEEKLY_PLAN_KEY));
  } else {
    await db.insert(preferencesTable).values({ key: WEEKLY_PLAN_KEY, value });
  }

  res.json(prefs);
});

export default router;
