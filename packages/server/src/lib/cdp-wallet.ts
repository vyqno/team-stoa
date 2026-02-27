import { CdpWalletProvider } from "@coinbase/agentkit";
import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const USDC_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

// Cooldown: don't retry wallet creation for 60s after a failure
let lastFailure = 0;
const COOLDOWN_MS = 60_000;

export async function createCdpWallet(_userId: string): Promise<{
  address: string;
  walletId: string;
} | null> {
  // Skip if we recently failed (rate limit protection)
  if (Date.now() - lastFailure < COOLDOWN_MS) {
    console.log("CDP wallet creation skipped — cooldown active");
    return null;
  }

  const apiKeyName = process.env.CDP_API_KEY_ID;
  const apiKeyPrivateKey = process.env.CDP_API_KEY_SECRET;

  if (!apiKeyName || !apiKeyPrivateKey) {
    console.warn("CDP credentials not configured — skipping wallet creation");
    return null;
  }

  try {
    const wallet = await CdpWalletProvider.configureWithWallet({
      apiKeyName,
      apiKeyPrivateKey,
      networkId: "base-sepolia",
    });

    const walletData = await wallet.exportWallet();
    const walletDataStr = JSON.stringify(walletData);

    return {
      address: wallet.getAddress(),
      walletId: walletDataStr,
    };
  } catch (err) {
    lastFailure = Date.now();
    console.error("CDP wallet creation failed (cooldown 60s):", err);
    return null;
  }
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
