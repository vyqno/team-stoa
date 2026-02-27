import { CdpWalletProvider } from "@coinbase/agentkit";
import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const USDC_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

export async function createCdpWallet(userId: string): Promise<{
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

  // Single attempt — no retries, no global cooldown
  const wallet = await CdpWalletProvider.configureWithWallet({
    apiKeyName,
    apiKeyPrivateKey: apiKeyPrivateKey.replace(/\\n/g, "\n"),
    networkId: "base-sepolia",
  });

  const walletData = await wallet.exportWallet();

  console.log(`CDP wallet created for user ${userId}: ${wallet.getAddress()}`);
  return {
    address: wallet.getAddress(),
    walletId: JSON.stringify(walletData),
  };
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
