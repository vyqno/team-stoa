import { Hono } from "hono";
import { UUID_REGEX } from "@stoa/shared";
import { getServiceById, logCall, updateServiceMetrics } from "@stoa/db";
import { resourceServer, X402_NETWORK } from "../lib/facilitator.js";

const PROVIDER_WALLET = process.env.PROVIDER_WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";

export const callRouter = new Hono();

// POST /v1/call/:serviceId — x402 proxy
callRouter.post("/:serviceId", async (c) => {
  const serviceId = c.req.param("serviceId");
  if (!UUID_REGEX.test(serviceId)) {
    return c.json({ error: "Service not found" }, 404);
  }

  const service = await getServiceById(serviceId);
  if (!service || !service.isActive) {
    return c.json({ error: "Service not found or inactive" }, 404);
  }

  // FREE SERVICES — skip payment entirely
  const isFree = Number(service.priceUsdcPerCall) === 0;

  if (isFree) {
    // Call provider directly without payment
    const startTime = Date.now();
    try {
      const body = await c.req.text();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const isHF = service.endpointUrl.includes("huggingface.co") ||
        service.endpointUrl.includes("hf.space");
      if (isHF && process.env.HF_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.HF_TOKEN}`;
      }

      const providerResponse = await fetch(service.endpointUrl, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(30000),
      });

      const latencyMs = Date.now() - startTime;
      if (!providerResponse.ok) {
        logCall({ serviceId, callerAddress: "free", success: false, latencyMs, costUsdc: 0, errorMessage: `Provider returned ${providerResponse.status}` }).catch(() => { });
        updateServiceMetrics(serviceId, false, latencyMs).catch(() => { });
        return c.json({ error: "Service returned an error" }, 502);
      }

      logCall({ serviceId, callerAddress: "free", success: true, latencyMs, costUsdc: 0 }).catch(() => { });
      updateServiceMetrics(serviceId, true, latencyMs).catch(() => { });

      const result = await providerResponse.json();
      return c.json({ result, cost: 0, latencyMs, free: true });
    } catch {
      const latencyMs = Date.now() - startTime;
      logCall({ serviceId, callerAddress: "free", success: false, latencyMs, costUsdc: 0, errorMessage: "Service endpoint unreachable" }).catch(() => { });
      updateServiceMetrics(serviceId, false, latencyMs).catch(() => { });
      return c.json({ error: "Service endpoint unreachable" }, 502);
    }
  }

  // PAID SERVICES — require x402 payment
  // Check for payment header
  const paymentHeader = c.req.header("X-PAYMENT");

  if (!paymentHeader) {
    // Build payment requirements for this specific service
    try {
      const requirements = await resourceServer.buildPaymentRequirements({
        scheme: "exact",
        payTo: service.ownerAddress || PROVIDER_WALLET,
        price: service.priceUsdcPerCall,
        network: X402_NETWORK,
        maxTimeoutSeconds: 60,
      });

      return c.json(
        {
          x402Version: 2,
          error: "Payment required",
          resource: {
            url: c.req.url,
            description: service.name,
            mimeType: "application/json",
          },
          accepts: requirements,
        },
        402,
      );
    } catch (err) {
      console.error("Failed to build payment requirements:", err);
      return c.json({ error: "Payment system temporarily unavailable" }, 503);
    }
  }

  // Payment present — verify it
  let paymentPayload;
  try {
    paymentPayload = JSON.parse(
      Buffer.from(paymentHeader.replace(/^base64:/, ""), "base64").toString("utf-8"),
    );
  } catch {
    return c.json({ error: "Invalid payment header format" }, 400);
  }

  const requirements = paymentPayload.accepted;
  const verifyResult = await resourceServer.verifyPayment(paymentPayload, requirements);

  if (!verifyResult.isValid) {
    return c.json(
      { error: "Payment verification failed", reason: verifyResult.invalidReason },
      403,
    );
  }

  // Forward request to provider
  const startTime = Date.now();
  let providerResponse;

  try {
    const body = await c.req.text();

    // Build headers — inject HF token for HuggingFace endpoints
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const isHF = service.endpointUrl.includes("router.huggingface.co") ||
      service.endpointUrl.includes("api-inference.huggingface.co");
    if (isHF && process.env.HF_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.HF_TOKEN}`;
    }

    providerResponse = await fetch(service.endpointUrl, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    // Log failure, DON'T settle payment
    const latencyMs = Date.now() - startTime;
    logCall({
      serviceId,
      callerAddress: verifyResult.payer || "unknown",
      success: false,
      latencyMs,
      costUsdc: 0,
      errorMessage: "Service endpoint unreachable",
    }).catch(() => { });
    updateServiceMetrics(serviceId, false, latencyMs).catch(() => { });

    return c.json({ error: "Service endpoint unreachable" }, 502);
  }

  const latencyMs = Date.now() - startTime;
  const success = providerResponse.ok;

  if (!success) {
    // DON'T settle on error
    logCall({
      serviceId,
      callerAddress: verifyResult.payer || "unknown",
      success: false,
      latencyMs,
      costUsdc: 0,
      errorMessage: `Provider returned ${providerResponse.status}`,
    }).catch(() => { });
    updateServiceMetrics(serviceId, false, latencyMs).catch(() => { });

    if (providerResponse.status >= 500) {
      return c.json({ error: "Service returned an error" }, 502);
    }
    // Forward 4xx as-is
    const errorBody = await providerResponse.text();
    return c.text(errorBody, providerResponse.status as 400);
  }

  // Success — settle payment and return result
  let txHash = "";
  let basescanUrl = "";

  resourceServer
    .settlePayment(paymentPayload, requirements)
    .then((settleResult) => {
      txHash = settleResult.transaction || "";
      basescanUrl = txHash
        ? `https://sepolia.basescan.org/tx/${txHash}`
        : "";
    })
    .catch((err) => {
      console.error("Settlement error:", err);
    });

  // Log success (async, don't block)
  logCall({
    serviceId,
    callerAddress: verifyResult.payer || "unknown",
    success: true,
    latencyMs,
    costUsdc: service.priceUsdcPerCall,
    txHash: txHash || undefined,
  }).catch(() => { });
  updateServiceMetrics(serviceId, true, latencyMs).catch(() => { });

  // Fire webhook if configured
  if (service.webhookUrl) {
    fetch(service.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "service_called",
        service: service.name,
        cost: service.priceUsdcPerCall,
        caller: verifyResult.payer || "unknown",
        txHash: txHash || null,
        basescanUrl: basescanUrl || null,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => { });
  }

  const result = await providerResponse.json();
  return c.json({
    result,
    cost: service.priceUsdcPerCall,
    txHash: txHash || "settling...",
    basescanUrl: basescanUrl || "settling...",
    latencyMs,
  });
});
