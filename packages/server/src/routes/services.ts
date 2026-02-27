import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import {
  serviceRegistrationSchema,
  searchQuerySchema,
  UUID_REGEX,
} from "@stoa/shared";
import {
  createService,
  getServiceById,
  listServices,
  setServiceActive,
  setServiceVerified,
  updateService,
  updateServiceMetrics,
  updateServiceEmbedding,
  semanticSearch,
  logCall,
  getServiceCallLogs,
  getUserById,
  getUserByApiKey,
} from "@stoa/db";
import { generateEmbedding, generateServiceEmbedding } from "../lib/embeddings.js";

const JWT_SECRET = process.env.JWT_SECRET || "stoa-dev-secret";

export const servicesRouter = new Hono();

// Helper: optionally extract userId from JWT or API key (non-blocking)
async function tryGetUserId(c: { req: { header: (name: string) => string | undefined } }): Promise<string | undefined> {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: string };
      return payload.userId;
    } catch { /* ignore */ }
  }

  const apiKey = c.req.header("X-Stoa-Key");
  if (apiKey) {
    const { createHash } = await import("node:crypto");
    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const user = await getUserByApiKey(keyHash);
    if (user) return user.id;
  }

  return undefined;
}

// POST /api/services — register a new service
servicesRouter.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = serviceRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.issues }, 400);
  }

  const data = parsed.data;
  const embedding = await generateServiceEmbedding({
    name: data.name,
    description: data.description,
    capabilities: data.capabilities,
  });

  const verificationToken = `stoa_verify_${randomUUID()}`;

  // Auto-link to authenticated user if available
  const userId = await tryGetUserId(c);

  const service = await createService({
    ...data,
    priceUsdcPerCall: String(data.priceUsdcPerCall),
    embedding,
    metadataHash: verificationToken,
    userId,
  });

  return c.json({
    service,
    verificationToken,
    verifyUrl: `/api/services/${service.id}/verify`,
  }, 201);
});

// POST /api/services/:id/verify — verify a service endpoint
servicesRouter.post("/:id/verify", async (c) => {
  const id = c.req.param("id");
  if (!UUID_REGEX.test(id)) {
    return c.json({ error: "Invalid service ID" }, 404);
  }

  const service = await getServiceById(id);
  if (!service) {
    return c.json({ error: "Service not found" }, 404);
  }

  try {
    const response = await fetch(service.endpointUrl, { method: "GET", signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      await setServiceVerified(id, true);
      return c.json({ verified: true, message: "Service endpoint is reachable" });
    }
    return c.json({ verified: false, message: `Endpoint returned ${response.status}` }, 400);
  } catch {
    return c.json({ verified: false, message: "Endpoint unreachable" }, 400);
  }
});

// POST /api/services/search — semantic search
servicesRouter.post("/search", async (c) => {
  const body = await c.req.json();
  const parsed = searchQuerySchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.issues }, 400);
  }

  const { query, category, limit } = parsed.data;
  const queryEmbedding = await generateEmbedding(query);
  const results = await semanticSearch(
    queryEmbedding,
    category ? { category } : undefined,
    limit,
  );

  return c.json({ services: results, query, totalCount: results.length });
});

// GET /api/services — list services
servicesRouter.get("/", async (c) => {
  const category = c.req.query("category");
  const serviceType = c.req.query("serviceType");
  const sort = c.req.query("sort") as "newest" | "popular" | "cheapest" | undefined;
  const limit = Number(c.req.query("limit") || "20");
  const offset = Number(c.req.query("offset") || "0");
  const ownerAddress = c.req.query("ownerAddress");
  const userId = c.req.query("userId");

  const services = await listServices({
    category: category || undefined,
    serviceType: serviceType || undefined,
    sort: sort || "newest",
    limit,
    offset,
    ownerAddress: ownerAddress || undefined,
    userId: userId || undefined,
  });

  return c.json({ services, count: services.length });
});

// GET /api/services/:id — get service details
servicesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  if (!UUID_REGEX.test(id)) {
    return c.json({ error: "Service not found" }, 404);
  }

  const service = await getServiceById(id);
  if (!service) {
    return c.json({ error: "Service not found" }, 404);
  }

  const recentCalls = await getServiceCallLogs(id, 10);

  // Include provider info if service is linked to a user
  let provider = null;
  if (service.userId) {
    const user = await getUserById(service.userId);
    if (user) {
      provider = {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        email: user.email,
      };
    }
  }

  return c.json({ service, provider, recentCalls });
});

// PUT /api/services/:id — update a service (auth required, must own)
servicesRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  if (!UUID_REGEX.test(id)) {
    return c.json({ error: "Invalid service ID" }, 404);
  }

  const userId = await tryGetUserId(c);
  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const service = await getServiceById(id);
  if (!service) {
    return c.json({ error: "Service not found" }, 404);
  }

  if (service.userId !== userId) {
    return c.json({ error: "You do not own this service" }, 403);
  }

  const body = await c.req.json();
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.priceUsdcPerCall !== undefined) updateData.priceUsdcPerCall = String(body.priceUsdcPerCall);
  if (body.endpointUrl !== undefined) updateData.endpointUrl = body.endpointUrl;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.serviceType !== undefined) updateData.serviceType = body.serviceType;
  if (body.capabilities !== undefined) updateData.capabilities = body.capabilities;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const updated = await updateService(id, updateData);

  // Regenerate embedding if name/description/capabilities changed
  if (body.name || body.description || body.capabilities) {
    const s = updated || service;
    const embedding = await generateServiceEmbedding({
      name: s.name,
      description: s.description,
      capabilities: s.capabilities as string[],
    });
    await updateServiceEmbedding(id, embedding);
  }

  return c.json({ service: updated });
});

// DELETE /api/services/:id — deactivate a service (auth required, must own)
servicesRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!UUID_REGEX.test(id)) {
    return c.json({ error: "Invalid service ID" }, 404);
  }

  const userId = await tryGetUserId(c);
  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }

  const service = await getServiceById(id);
  if (!service) {
    return c.json({ error: "Service not found" }, 404);
  }

  if (service.userId !== userId) {
    return c.json({ error: "You do not own this service" }, 403);
  }

  await setServiceActive(id, false);
  return c.json({ deactivated: true, serviceId: id });
});

// POST /api/services/:id/metrics — log a call + update metrics
servicesRouter.post("/:id/metrics", async (c) => {
  const id = c.req.param("id");
  if (!UUID_REGEX.test(id)) {
    return c.json({ error: "Invalid service ID" }, 404);
  }

  const body = await c.req.json();
  const { success, latencyMs, costUsdc, txHash, userId, callerAddress } = body;

  await logCall({
    serviceId: id,
    userId,
    callerAddress: callerAddress || "unknown",
    success,
    latencyMs,
    costUsdc: costUsdc || 0,
    txHash,
  });

  await updateServiceMetrics(id, success, latencyMs);

  // Fire webhook if configured
  const service = await getServiceById(id);
  if (service?.webhookUrl) {
    fetch(service.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "service_called",
        service: service.name,
        cost: costUsdc,
        caller: callerAddress || "unknown",
        txHash: txHash || null,
        basescanUrl: txHash ? `https://sepolia.basescan.org/tx/${txHash}` : null,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // fire-and-forget webhook, don't block response
    });
  }

  return c.json({ logged: true });
});

// POST /api/services/:id/embedding — regenerate embedding
servicesRouter.post("/:id/embedding", async (c) => {
  const id = c.req.param("id");
  if (!UUID_REGEX.test(id)) {
    return c.json({ error: "Invalid service ID" }, 404);
  }

  const service = await getServiceById(id);
  if (!service) {
    return c.json({ error: "Service not found" }, 404);
  }

  const embedding = await generateServiceEmbedding({
    name: service.name,
    description: service.description,
    capabilities: service.capabilities as string[],
  });

  await updateServiceEmbedding(id, embedding);

  return c.json({ updated: true, dimensions: embedding.length });
});
