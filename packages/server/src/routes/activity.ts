import { Hono } from "hono";
import { getGlobalRecentCalls, getServiceById } from "@stoa/db";

export const activityRouter = new Hono();

// GET /api/activity — global recent marketplace calls (public)
activityRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") || "20");
  const calls = await getGlobalRecentCalls(Math.min(limit, 50));

  // Enrich with service names
  const enriched = await Promise.all(
    calls.map(async (call) => {
      const service = await getServiceById(call.serviceId);
      return {
        id: call.id,
        serviceName: service?.name || "Unknown",
        serviceId: call.serviceId,
        callerAddress: call.callerAddress,
        costUsdc: call.costUsdc,
        success: call.success,
        latencyMs: call.latencyMs,
        txHash: call.txHash,
        basescanUrl: call.txHash ? `https://sepolia.basescan.org/tx/${call.txHash}` : null,
        createdAt: call.createdAt,
      };
    }),
  );

  return c.json({ activity: enriched, count: enriched.length });
});
