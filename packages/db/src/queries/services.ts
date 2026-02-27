import { eq, desc, asc, and, sql } from "drizzle-orm";
import { db } from "../client.js";
import { services } from "../schema.js";

export interface ListServicesOptions {
  category?: string;
  serviceType?: string;
  sort?: "newest" | "popular" | "cheapest";
  limit?: number;
  offset?: number;
  ownerAddress?: string;
  userId?: string;
}

function mapService(row: typeof services.$inferSelect) {
  return {
    ...row,
    priceUsdcPerCall: Number(row.priceUsdcPerCall),
    successRate: Number(row.successRate),
  };
}

export async function createService(data: typeof services.$inferInsert) {
  const [row] = await db.insert(services).values(data).returning();
  return mapService(row);
}

export async function getServiceById(id: string) {
  const [row] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return row ? mapService(row) : null;
}

export async function listServices(opts: ListServicesOptions = {}) {
  const conditions = [];
  if (opts.category) conditions.push(eq(services.category, opts.category));
  if (opts.serviceType) conditions.push(eq(services.serviceType, opts.serviceType));
  if (opts.ownerAddress) conditions.push(eq(services.ownerAddress, opts.ownerAddress));
  if (opts.userId) conditions.push(eq(services.userId, opts.userId));
  conditions.push(eq(services.isActive, true));

  const orderBy =
    opts.sort === "popular"
      ? desc(services.totalCalls)
      : opts.sort === "cheapest"
        ? asc(services.priceUsdcPerCall)
        : desc(services.createdAt);

  const rows = await db
    .select()
    .from(services)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(opts.limit ?? 20)
    .offset(opts.offset ?? 0);

  return rows.map(mapService);
}

export async function updateServiceMetrics(id: string, success: boolean, latencyMs: number) {
  await db
    .update(services)
    .set({
      totalCalls: sql`${services.totalCalls} + 1`,
      avgLatencyMs: sql`CASE WHEN ${services.totalCalls} = 0 THEN ${latencyMs}
        ELSE (${services.avgLatencyMs} * ${services.totalCalls} + ${latencyMs}) / (${services.totalCalls} + 1)
        END`,
      successRate: success
        ? sql`(${services.successRate} * ${services.totalCalls} + 100) / (${services.totalCalls} + 1)`
        : sql`(${services.successRate} * ${services.totalCalls}) / (${services.totalCalls} + 1)`,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id));
}

export async function setServiceActive(id: string, active: boolean) {
  await db.update(services).set({ isActive: active, updatedAt: new Date() }).where(eq(services.id, id));
}

export async function updateService(
  id: string,
  data: {
    name?: string;
    description?: string;
    priceUsdcPerCall?: string;
    endpointUrl?: string;
    category?: string;
    serviceType?: string;
    capabilities?: string[];
    isActive?: boolean;
  },
) {
  const [row] = await db
    .update(services)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();
  return row
    ? { ...row, priceUsdcPerCall: Number(row.priceUsdcPerCall), successRate: Number(row.successRate) }
    : null;
}

export async function setServiceVerified(id: string, verified: boolean) {
  await db.update(services).set({ isVerified: verified, updatedAt: new Date() }).where(eq(services.id, id));
}

export async function updateServiceEmbedding(id: string, embedding: number[]) {
  await db.update(services).set({ embedding, updatedAt: new Date() }).where(eq(services.id, id));
}
