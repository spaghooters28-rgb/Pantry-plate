import { db, aiUsageTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const AI_MONTHLY_CAP = 100;

function getYearMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function checkAndIncrementAiUsage(userId: number): Promise<{ allowed: boolean; used: number; cap: number }> {
  const yearMonth = getYearMonth();

  await db
    .insert(aiUsageTable)
    .values({ userId, yearMonth, count: 1 })
    .onConflictDoUpdate({
      target: [aiUsageTable.userId, aiUsageTable.yearMonth],
      set: { count: sql`${aiUsageTable.count} + 1` },
    });

  const [row] = await db
    .select({ count: aiUsageTable.count })
    .from(aiUsageTable)
    .where(and(eq(aiUsageTable.userId, userId), eq(aiUsageTable.yearMonth, yearMonth)));

  const used = row?.count ?? 1;
  return { allowed: used <= AI_MONTHLY_CAP, used, cap: AI_MONTHLY_CAP };
}

export async function getAiUsage(userId: number): Promise<{ used: number; cap: number; yearMonth: string }> {
  const yearMonth = getYearMonth();
  const [row] = await db
    .select({ count: aiUsageTable.count })
    .from(aiUsageTable)
    .where(and(eq(aiUsageTable.userId, userId), eq(aiUsageTable.yearMonth, yearMonth)));
  return { used: row?.count ?? 0, cap: AI_MONTHLY_CAP, yearMonth };
}
