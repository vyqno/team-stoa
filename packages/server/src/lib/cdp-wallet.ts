import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const USDC_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

// --- Per-user deduplication + rate-limit protection ---

const inFlightCreations = new Map<
  string,
  Promise<{ address: string; walletId: string }>
>();

let globalCooldownUntil = 0;
const COOLDOWN_MS = 60_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delayWithJitter(attempt: number): number {
  const base = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = base * 0.5 * Math.random();
  return base + jitter;
}

async function createCdpWalletInternal(userId: string): Promise<{
  address: string;
  walletId: string;
}> {
  const apiKeyName = process.env.CDP_API_KEY_ID;
  const apiKeyPrivateKey = process.env.CDP_API_KEY_SECRET;

  if (!apiKeyName || !apiKeyPrivateKey) {
    throw new Error(
      "CDP credentials not configured. Set CDP_API_KEY_ID and CDP_API_KEY_SECRET.",
    );
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Check global cooldown before each attempt
    const now = Date.now();
    if (now < globalCooldownUntil) {
      const waitMs = globalCooldownUntil - now;
      console.warn(
        `CDP global cooldown active, waiting ${Math.ceil(waitMs / 1000)}s before attempt for user ${userId}`,
      );
      await sleep(waitMs);
    }

    try {
      const cdp = new CdpClient({
        apiKeyId: apiKeyName,
        apiKeySecret: apiKeyPrivateKey.replace(/\\n/g, "\n"),
        walletSecret: process.env.CDP_WALLET_SECRET,
      });

      // Pass idempotency key or rely on retries creating new ones on fail
      const account = await cdp.evm.createAccount({
        idempotencyKey: `wallet_create_${userId}_${attempt}`,
      });

      // Note: The new SDK doesn't have an export method on ServerAccount directly
      // However we can use exportAccount if needed - but the API requires the user to securely store the private key
      // If we just need the address, we can use it directly:
      const address = account.address;

      let privateKeyHex = "";
      try {
        privateKeyHex = await cdp.evm.exportAccount({
          address,
          idempotencyKey: `wallet_export_${userId}_${attempt}`,
        });
      } catch (e) {
        console.error("Failed to export private key, storing only address", e);
      }

      console.log(
        `CDP wallet created for user ${userId}: ${address}`,
      );

      return {
        address,
        walletId: JSON.stringify({ address, privateKey: privateKeyHex }),
      };
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      const is429 = status === 429 || /too many requests/i.test(err?.message ?? "");

      if (is429) {
        globalCooldownUntil = Date.now() + COOLDOWN_MS;
        console.warn(
          `CDP 429 rate limit hit (attempt ${attempt + 1}/${MAX_RETRIES + 1}) for user ${userId}, cooldown ${COOLDOWN_MS / 1000}s`,
        );

        if (attempt < MAX_RETRIES) {
          const delay = delayWithJitter(attempt);
          console.log(`Retrying in ${Math.ceil(delay / 1000)}s...`);
          await sleep(delay);
          continue;
        }
      }

      // Non-retryable error or exhausted retries
      throw err;
    }
  }

  // Should not reach here, but TypeScript needs it
  throw new Error("CDP wallet creation failed after retries");
}

export async function createCdpWallet(userId: string): Promise<{
  address: string;
  walletId: string;
}> {
  // Return existing in-flight promise for this user (deduplication)
  const existing = inFlightCreations.get(userId);
  if (existing) {
    console.log(`CDP wallet creation already in-flight for user ${userId}, deduplicating`);
    return existing;
  }

  const promise = createCdpWalletInternal(userId).finally(() => {
    inFlightCreations.delete(userId);
  });

  inFlightCreations.set(userId, promise);
  return promise;
}

export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const balance = await client.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [walletAddress as `0x${string}`],
    });

    return Number(balance) / 1e6;
  } catch (err) {
    console.error("Balance query failed:", err);
    return 0;
  }
}
