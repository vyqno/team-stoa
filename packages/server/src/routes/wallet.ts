import { Hono } from "hono";
import { authenticateApiKey, getAuthUser } from "../middleware/auth.js";
import { getUserCallLogs, getUserUsageStats, updateUserWallet } from "@stoa/db";
import { createCdpWallet, getWalletBalance } from "../lib/cdp-wallet.js";

export const walletRouter = new Hono();

// All wallet routes require authentication
walletRouter.use("*", authenticateApiKey);

async function ensureWallet(user: ReturnType<typeof getAuthUser>): Promise<ReturnType<typeof getAuthUser> & { walletError?: string }> {
  if (user.walletAddress) return user;

  try {
    const wallet = await createCdpWallet(user.id);
    await updateUserWallet(user.id, wallet.address, wallet.walletId);
    user.walletAddress = wallet.address;
    user.cdpWalletId = wallet.walletId;
    return user;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`ensureWallet failed for user ${user.id}:`, msg);
    return Object.assign(user, { walletError: msg });
  }
}

// GET /api/wallet/balance
walletRouter.get("/balance", async (c) => {
  const result = await ensureWallet(getAuthUser(c));

  if (!result.walletAddress) {
    return c.json({
      address: null,
      balanceUsdc: 0,
      network: "base-sepolia",
      error: (result as any).walletError || "Wallet not yet created",
    }, 503);
  }

  const balanceUsdc = await getWalletBalance(result.walletAddress);

  return c.json({
    address: result.walletAddress,
    balanceUsdc,
    network: "base-sepolia",
  });
});

// GET /api/wallet/address
walletRouter.get("/address", async (c) => {
  const result = await ensureWallet(getAuthUser(c));

  if (!result.walletAddress) {
    return c.json({
      address: null,
      error: (result as any).walletError || "Wallet provisioning failed",
    }, 503);
  }

  return c.json({
    address: result.walletAddress,
    message: "Send USDC (Base Sepolia) to this address to fund your account",
  });
});

// GET /api/wallet/transactions
walletRouter.get("/transactions", async (c) => {
  const user = getAuthUser(c);
  const limit = Number(c.req.query("limit") || "20");
  const calls = await getUserCallLogs(user.id, limit);
  return c.json({ transactions: calls });
});

// GET /api/wallet/usage
walletRouter.get("/usage", async (c) => {
  const user = getAuthUser(c);
  const stats = await getUserUsageStats(user.id);
  return c.json(stats);
});

// POST /api/wallet/withdraw
walletRouter.post("/withdraw", async (c) => {
  const user = getAuthUser(c);

  if (!user.walletAddress) {
    return c.json({ error: "No wallet provisioned" }, 400);
  }

  const { toAddress, amountUsdc } = await c.req.json();

  if (!toAddress || !amountUsdc || amountUsdc <= 0) {
    return c.json({ error: "Invalid withdrawal parameters" }, 400);
  }

  // TODO: Execute USDC transfer via CDP wallet when full withdrawal is implemented
  return c.json({
    message: "Withdrawal queued",
    toAddress,
    amountUsdc,
    txHash: null,
    status: "pending",
  });
});
