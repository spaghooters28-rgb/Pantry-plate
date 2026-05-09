import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, preferencesTable } from "@workspace/db";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

const WEEKLY_PLAN_KEY = "weekly-plan";

const DEFAULT_PREFS = {
  cuisine: null,
  proteins: [] as string[],
  glutenFree: null,
  activeDays: [] as string[],
};

async function getPrefs(userId: number) {
  const [row] = await db
    .select()
    .from(preferencesTable)
    .where(and(eq(preferencesTable.userId, userId), eq(preferencesTable.key, WEEKLY_PLAN_KEY)));

  if (!row) return DEFAULT_PREFS;

  try {
    return JSON.parse(row.value) as typeof DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

router.get("/preferences/weekly-plan", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  res.json(await getPrefs(userId));
});

router.put("/preferences/weekly-plan", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
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
    .where(and(eq(preferencesTable.userId, userId), eq(preferencesTable.key, WEEKLY_PLAN_KEY)));

  if (existing.length > 0) {
    await db
      .update(preferencesTable)
      .set({ value, updatedAt: new Date() })
      .where(and(eq(preferencesTable.userId, userId), eq(preferencesTable.key, WEEKLY_PLAN_KEY)));
  } else {
    await db.insert(preferencesTable).values({ userId, key: WEEKLY_PLAN_KEY, value });
  }

  res.json(prefs);
});

export default router;
