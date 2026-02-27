import { eq, and, cosineDistance, desc, sql } from "drizzle-orm";
import { db } from "../client.js";
import { services } from "../schema.js";

export interface SearchFilters {
  category?: string;
  serviceType?: string;
}

export async function semanticSearch(
  queryEmbedding: number[],
  filters?: SearchFilters,
  limit = 5,
) {
  const conditions = [eq(services.isActive, true)];
  if (filters?.category) {
    conditions.push(eq(services.category, filters.category));
  }
  if (filters?.serviceType) {
    conditions.push(eq(services.serviceType, filters.serviceType));
  }

  const similarity = sql<number>`1 - (${cosineDistance(services.embedding, queryEmbedding)})`;

  const rows = await db
    .select({
      id: services.id,
      ownerAddress: services.ownerAddress,
      name: services.name,
      description: services.description,
      capabilities: services.capabilities,
      category: services.category,
      serviceType: services.serviceType,
      priceUsdcPerCall: services.priceUsdcPerCall,
      endpointUrl: services.endpointUrl,
      inputSchema: services.inputSchema,
      outputSchema: services.outputSchema,
      totalCalls: services.totalCalls,
      successRate: services.successRate,
      avgLatencyMs: services.avgLatencyMs,
      isActive: services.isActive,
      isVerified: services.isVerified,
      metadataHash: services.metadataHash,
      webhookUrl: services.webhookUrl,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
      similarity,
    })
    .from(services)
    .where(and(...conditions))
    .orderBy(desc(similarity))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    priceUsdcPerCall: Number(row.priceUsdcPerCall),
    successRate: Number(row.successRate),
    similarity: Number(row.similarity),
  }));
}
