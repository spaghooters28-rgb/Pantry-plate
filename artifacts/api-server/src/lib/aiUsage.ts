import { db, aiUsageTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const AI_MONTHLY_CAP = 100;

function getYearMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function checkAndIncrementAiUsage(userId: number): Promise<{ allowed: boolean; used: number; cap: number }> {
  const yearMonth = getYearMonth();

  // Pre-check before incrementing to avoid counting over-limit requests
  const [existing] = await db
    .select({ count: aiUsageTable.count })
    .from(aiUsageTable)
    .where(and(eq(aiUsageTable.userId, userId), eq(aiUsageTable.yearMonth, yearMonth)));

  const currentCount = existing?.count ?? 0;
  if (currentCount >= AI_MONTHLY_CAP) {
    return { allowed: false, used: currentCount, cap: AI_MONTHLY_CAP };
  }

  // Allowed — increment atomically
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
  return { allowed: true, used, cap: AI_MONTHLY_CAP };
}

export async function getAiUsage(userId: number): Promise<{ used: number; cap: number; yearMonth: string }> {
  const yearMonth = getYearMonth();
  const [row] = await db
    .select({ count: aiUsageTable.count })
    .from(aiUsageTable)
    .where(and(eq(aiUsageTable.userId, userId), eq(aiUsageTable.yearMonth, yearMonth)));
  return { used: row?.count ?? 0, cap: AI_MONTHLY_CAP, yearMonth };
}
