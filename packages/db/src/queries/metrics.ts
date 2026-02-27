import { eq, desc, sql, count, countDistinct } from "drizzle-orm";
import { db } from "../client.js";
import { callLogs } from "../schema.js";

export interface LogCallData {
  serviceId: string;
  userId?: string;
  callerAddress: string;
  success: boolean;
  latencyMs: number;
  costUsdc: number;
  txHash?: string;
  errorMessage?: string;
}

export async function logCall(data: LogCallData) {
  await db.insert(callLogs).values({
    serviceId: data.serviceId,
    userId: data.userId,
    callerAddress: data.callerAddress,
    costUsdc: String(data.costUsdc),
    txHash: data.txHash,
    latencyMs: data.latencyMs,
    success: data.success,
    errorMessage: data.errorMessage,
  });
}

export async function getServiceCallLogs(serviceId: string, limit = 20) {
  const rows = await db
    .select()
    .from(callLogs)
    .where(eq(callLogs.serviceId, serviceId))
    .orderBy(desc(callLogs.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    costUsdc: Number(row.costUsdc),
  }));
}

export async function getGlobalRecentCalls(limit = 20) {
  const rows = await db
    .select()
    .from(callLogs)
    .orderBy(desc(callLogs.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    costUsdc: Number(row.costUsdc),
  }));
}

export async function getUserUsageStats(userId: string) {
  const [stats] = await db
    .select({
      totalCalls: count(),
      totalSpent: sql<string>`COALESCE(SUM(${callLogs.costUsdc}), 0)`,
      servicesUsed: countDistinct(callLogs.serviceId),
    })
    .from(callLogs)
    .where(eq(callLogs.userId, userId));

  return {
    totalCalls: stats.totalCalls,
    totalSpentUsdc: Number(stats.totalSpent),
    servicesUsed: stats.servicesUsed,
  };
}

export async function getUserCallLogs(userId: string, limit = 20) {
  const rows = await db
    .select()
    .from(callLogs)
    .where(eq(callLogs.userId, userId))
    .orderBy(desc(callLogs.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    costUsdc: Number(row.costUsdc),
  }));
}
