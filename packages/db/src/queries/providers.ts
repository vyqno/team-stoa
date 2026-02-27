import { eq, sql, count } from "drizzle-orm";
import { db } from "../client.js";
import { services, callLogs } from "../schema.js";

export async function getProviderStats(userId: string) {
  const [serviceStats] = await db
    .select({
      totalServices: count(),
      totalCalls: sql<number>`COALESCE(SUM(${services.totalCalls}), 0)`,
    })
    .from(services)
    .where(eq(services.userId, userId));

  const [earningsStats] = await db
    .select({
      totalEarnings: sql<string>`COALESCE(SUM(${callLogs.costUsdc}), 0)`,
    })
    .from(callLogs)
    .innerJoin(services, eq(callLogs.serviceId, services.id))
    .where(eq(services.userId, userId));

  return {
    totalServices: serviceStats?.totalServices ?? 0,
    totalCalls: Number(serviceStats?.totalCalls ?? 0),
    totalEarnings: Number(earningsStats?.totalEarnings ?? 0),
  };
}
