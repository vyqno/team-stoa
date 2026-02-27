import { Hono } from "hono";
import { createHmac } from "node:crypto";
import { authenticateApiKey, getAuthUser } from "../middleware/auth.js";
import { logTopUp, getTopupHistory } from "@stoa/db";

export const topupRouter = new Hono();

topupRouter.use("*", authenticateApiKey);

const USD_INR_RATE = 83; // Fixed rate for hackathon demo

// POST /api/wallet/topup/razorpay — Create a Razorpay order
topupRouter.post("/razorpay", async (c) => {
  const user = getAuthUser(c);
  const { amountInr } = await c.req.json();

  if (!amountInr || amountInr < 100 || amountInr > 50000) {
    return c.json({ error: "Amount must be between ₹100 and ₹50,000" }, 400);
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return c.json({ error: "Razorpay not configured" }, 503);
  }

  const amountUsdc = amountInr / USD_INR_RATE;

  // Create Razorpay order via REST API (no npm package needed)
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountInr * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `stoa_topup_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        amountUsdc: amountUsdc.toFixed(6),
      },
    }),
  });

  if (!orderRes.ok) {
    const errBody = await orderRes.text();
    console.error("Razorpay order creation failed:", errBody);
    return c.json({ error: "Failed to create payment order" }, 502);
  }

  const order = (await orderRes.json()) as { id: string };

  return c.json({
    orderId: order.id,
    amountInr,
    estimatedUsdc: Number(amountUsdc.toFixed(6)),
    razorpayKeyId: keyId,
    usdInrRate: USD_INR_RATE,
  });
});

// POST /api/wallet/topup/razorpay/verify — Verify payment & credit USDC
topupRouter.post("/razorpay/verify", async (c) => {
  const user = getAuthUser(c);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amountInr } =
    await c.req.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return c.json({ error: "Missing payment verification fields" }, 400);
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return c.json({ error: "Razorpay not configured" }, 503);
  }

  // Verify signature
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return c.json({ error: "Payment verification failed — invalid signature" }, 403);
  }

  const amountUsdc = (amountInr || 500) / USD_INR_RATE;

  // Log the topup in the database
  await logTopUp(user.id, amountInr || 500, amountUsdc, razorpay_order_id);

  // In a real system, this would trigger a USDC transfer from treasury to user's CDP wallet
  // For hackathon demo, the topup is logged and the balance shown is from on-chain

  return c.json({
    success: true,
    amountInr: amountInr || 500,
    creditedUsdc: Number(amountUsdc.toFixed(6)),
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    message: "Payment verified! USDC will be credited to your wallet.",
  });
});

// GET /api/wallet/topup/history — Get topup history
topupRouter.get("/history", async (c) => {
  const user = getAuthUser(c);
  const txns = await getTopupHistory(user.id);
  return c.json({ transactions: txns });
});
