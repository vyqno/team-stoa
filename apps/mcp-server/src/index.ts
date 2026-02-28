#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { RegistryClient } from "./lib/registry-client.js";
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";
import { createPublicClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const USDC_ABI = parseAbi(["function balanceOf(address) view returns (uint256)"]);

async function getUsdcBalance(address: `0x${string}`): Promise<number> {
  try {
    const client = createPublicClient({ chain: baseSepolia, transport: http() });
    const balance = await client.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    return Number(balance) / 1e6;
  } catch {
    return -1;
  }
}

const STOA_API_URL = process.env.STOA_API_URL || "https://stoa-api-production-58bd.up.railway.app";
const STOA_API_KEY = process.env.STOA_API_KEY;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const CHEST_XRAY_URL = "https://hiteshx33-chest-xray-service.hf.space";
const PLANT_DISEASE_URL = "https://hiteshx33-plant-disease-service.hf.space";

const registry = new RegistryClient(STOA_API_URL, STOA_API_KEY);

// x402 client-side payment: signs USDC payments with user's wallet key
function createPaidFetch() {
  if (!WALLET_PRIVATE_KEY) return null;
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as `0x${string}`);
  const publicClient = createPublicClient({ chain: baseSepolia, transport: http() });
  const signer = toClientEvmSigner(account, publicClient);
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });
  return wrapFetchWithPayment(fetch, client);
}

const paidFetch = createPaidFetch();
const walletAddress = WALLET_PRIVATE_KEY
  ? privateKeyToAccount(WALLET_PRIVATE_KEY as `0x${string}`).address
  : null;

const server = new McpServer({
  name: "stoa",
  version: "1.0.0",
});

function requireAuth(): { content: { type: "text"; text: string }[] } | null {
  if (!STOA_API_KEY) {
    return {
      content: [{
        type: "text",
        text: "No STOA_API_KEY configured. Visit stoa.ai/connect to get your API key.",
      }],
    };
  }
  return null;
}

// ─────────────────────────────────────────────
// ACCOUNT TOOLS: Register & Login (no API key needed)
// ─────────────────────────────────────────────

server.tool(
  "create_account",
  "Create a new Stoa marketplace account. Returns an API key you can use to call services and manage your wallet.",
  {
    email: z.string().describe("Your email address"),
    password: z.string().describe("Choose a password (min 6 chars)"),
    displayName: z.string().optional().describe("Your display name on the marketplace"),
  },
  async ({ email, password, displayName }) => {
    try {
      const result = await registry.register(email, password, displayName);

      const text = [
        `**Account Created!**`,
        "",
        `Email: ${result.user.email}`,
        `User ID: ${result.user.id}`,
        `Wallet: ${result.user.walletAddress || "Will be provisioned on first use"}`,
        "",
        `**Your API Key:**`,
        `\`${result.apiKey}\``,
        "",
        `**IMPORTANT:** Save this key! Add it to your MCP config as \`STOA_API_KEY\` to unlock wallet, calling, and provider tools.`,
        "",
        "```json",
        JSON.stringify({
          mcpServers: {
            stoa: {
              command: "npx",
              args: ["-y", "stoa-mcp-server"],
              env: {
                STOA_API_KEY: result.apiKey,
              },
            },
          },
        }, null, 2),
        "```",
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Registration error: ${err}` }] };
    }
  },
);

server.tool(
  "login",
  "Log in to your existing Stoa account to get a JWT token",
  {
    email: z.string().describe("Your email address"),
    password: z.string().describe("Your password"),
  },
  async ({ email, password }) => {
    try {
      const result = await registry.login(email, password);

      const text = [
        `**Logged in!**`,
        "",
        `Email: ${result.user.email}`,
        `User ID: ${result.user.id}`,
        `Wallet: ${result.user.walletAddress || "Not yet provisioned"}`,
        "",
        `JWT Token: \`${result.token.slice(0, 20)}...\``,
        "",
        `Use your API key (from registration) in the MCP config for persistent access.`,
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Login error: ${err}` }] };
    }
  },
);

// ─────────────────────────────────────────────
// FREE TOOLS: Discovery
// ─────────────────────────────────────────────

server.tool(
  "find_service",
  "Search the Stoa AI marketplace for services by natural language query",
  {
    query: z.string().describe("Natural language search query (e.g. 'detect pneumonia from X-ray')"),
    category: z.string().optional().describe("Filter by category: medical, security, agriculture, data, creative, research, etc."),
    serviceType: z.string().optional().describe("Filter by type: ml-model, ai-agent, api-tool, data-feed, workflow"),
    limit: z.number().optional().describe("Max results (default 5)"),
  },
  async ({ query, category, serviceType, limit }) => {
    try {
      const services = await registry.search(query, { category, serviceType, limit: limit ?? 5 });

      if (services.length === 0) {
        return { content: [{ type: "text", text: `No services found matching "${query}"` }] };
      }

      const lines = [`Found ${services.length} services matching "${query}":\n`];
      services.forEach((s, i) => {
        lines.push(`${i + 1}. **${s.name}** [${s.serviceType}] — $${s.priceUsdcPerCall}/call`);
        lines.push(`   ${s.successRate}% success | ${s.totalCalls} calls | ${s.avgLatencyMs}ms avg`);
        lines.push(`   ${s.description}`);
        lines.push(`   ID: ${s.id}`);
        lines.push("");
      });

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Search error: ${err}` }] };
    }
  },
);

server.tool(
  "list_services",
  "List available services on the Stoa marketplace",
  {
    category: z.string().optional().describe("Filter by category"),
    serviceType: z.string().optional().describe("Filter by type: ml-model, ai-agent, api-tool, data-feed, workflow"),
    limit: z.number().optional().describe("Max results (default 10)"),
  },
  async ({ category, serviceType, limit }) => {
    try {
      const services = await registry.listServices({ category, serviceType, limit: limit ?? 10 });

      if (services.length === 0) {
        return { content: [{ type: "text", text: "No services available" }] };
      }

      const lines = [`Available services (${services.length}):\n`];
      services.forEach((s, i) => {
        lines.push(`${i + 1}. **${s.name}** [${s.serviceType} · ${s.category}] — $${s.priceUsdcPerCall}/call`);
        lines.push(`   ${s.description}`);
        lines.push(`   ID: ${s.id}`);
        lines.push("");
      });

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (err) {
      return { content: [{ type: "text", text: `List error: ${err}` }] };
    }
  },
);

server.tool(
  "get_service_schema",
  "Get detailed schema and pricing for a specific service",
  {
    serviceId: z.string().describe("The service ID"),
  },
  async ({ serviceId }) => {
    try {
      const { service: s, provider } = await registry.getService(serviceId);

      const text = [
        `**${s.name}**`,
        `Type: ${s.serviceType} | Category: ${s.category}`,
        `Price: $${s.priceUsdcPerCall}/call`,
        `Success rate: ${s.successRate}% | ${s.totalCalls} calls | ${s.avgLatencyMs}ms avg`,
        `Verified: ${s.isVerified ? "Yes" : "No"}`,
        provider ? `Provider: ${provider.displayName || provider.email || "Anonymous"}` : "",
        "",
        "**Input Schema:**",
        "```json",
        JSON.stringify(s.inputSchema, null, 2),
        "```",
        "",
        "**Output Schema:**",
        "```json",
        JSON.stringify(s.outputSchema, null, 2),
        "```",
      ].filter(Boolean).join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err}` }] };
    }
  },
);

server.tool(
  "get_activity",
  "View recent marketplace-wide activity — see what services are being called",
  {
    limit: z.number().optional().describe("Number of recent calls to show (default 10)"),
  },
  async ({ limit }) => {
    try {
      const data = await registry.getActivity(limit ?? 10);

      if (data.activity.length === 0) {
        return { content: [{ type: "text", text: "No recent activity on the marketplace." }] };
      }

      const lines = [`**Recent Marketplace Activity** (${data.count} calls):\n`];
      data.activity.forEach((a, i) => {
        const status = a.success ? "OK" : "FAIL";
        const cost = `$${a.costUsdc}`;
        const tx = a.basescanUrl ? ` | [tx](${a.basescanUrl})` : "";
        lines.push(`${i + 1}. **${a.serviceName}** — ${cost} — ${status} — ${a.latencyMs}ms${tx}`);
      });

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Activity error: ${err}` }] };
    }
  },
);

server.tool(
  "get_provider",
  "View a provider's public profile and their services",
  {
    userId: z.string().describe("The provider's user ID"),
  },
  async ({ userId }) => {
    try {
      const [profileData, servicesData] = await Promise.all([
        registry.getProvider(userId),
        registry.getProviderServices(userId),
      ]);

      const p = profileData.provider;
      const stats = profileData.stats;

      const lines = [
        `**${p.displayName || "Anonymous Provider"}**`,
        p.bio ? p.bio : "",
        "",
        `Services: ${stats.totalServices} | Total calls: ${stats.totalCalls} | Earnings: $${stats.totalEarnings} USDC`,
        "",
      ];

      if (servicesData.services.length > 0) {
        lines.push(`**Their Services (${servicesData.count}):**`);
        servicesData.services.forEach((s, i) => {
          lines.push(`${i + 1}. **${s.name}** [${s.serviceType}] — $${s.priceUsdcPerCall}/call`);
          lines.push(`   ${s.description}`);
          lines.push(`   ID: ${s.id}`);
          lines.push("");
        });
      }

      return { content: [{ type: "text", text: lines.filter(Boolean).join("\n") }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Provider error: ${err}` }] };
    }
  },
);

// ─────────────────────────────────────────────
// CHEST X-RAY: Direct ML inference (demo)
// ─────────────────────────────────────────────

server.tool(
  "analyze_xray",
  "Analyze a chest X-ray image for pneumonia detection. Provide the absolute file path to an X-ray image on disk. DO NOT pass base64 data — just the file path. The tool reads the file directly. This is a FREE service.",
  {
    filePath: z.string().describe("Absolute file path to a chest X-ray image (JPEG/PNG) on the user's computer, e.g. C:/Users/name/xray.jpg"),
  },
  async ({ filePath }) => {
    try {
      const absPath = resolve(filePath);
      const fileBuffer = await readFile(absPath);
      const base64Data = fileBuffer.toString("base64");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(`${CHEST_XRAY_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        return {
          content: [{
            type: "text",
            text: `X-ray analysis failed (${response.status}): ${errText}`,
          }],
        };
      }

      const result = (await response.json()) as {
        diagnosis: string;
        confidence: number;
        predictions: { label: string; score: number }[];
        model: string;
        latency_ms: number;
      };

      const diagEmoji = result.diagnosis === "PNEUMONIA" ? "⚠️" : "✅";
      const confidencePct = (result.confidence * 100).toFixed(1);

      const text = [
        `${diagEmoji} **Chest X-Ray Analysis Result**`,
        "",
        `**Diagnosis: ${result.diagnosis}**`,
        `**Confidence: ${confidencePct}%**`,
        "",
        "**All predictions:**",
        ...result.predictions.map(
          (p) => `- ${p.label}: ${(p.score * 100).toFixed(1)}%`,
        ),
        "",
        `Model: ${result.model}`,
        `Inference time: ${result.latency_ms}ms`,
        "",
        "⚕️ *This is an AI-assisted screening tool. Always consult a qualified radiologist for clinical decisions.*",
        "",
        `Powered by **Stoa AI Marketplace** — free service, no account required.`,
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return {
          content: [{
            type: "text",
            text: "X-ray analysis timed out (90s). The HuggingFace Space may be cold-starting — try again in 30 seconds.",
          }],
        };
      }
      return {
        content: [{
          type: "text",
          text: `X-ray analysis error: ${err?.message || err}`,
        }],
      };
    }
  },
);

// ─────────────────────────────────────────────
// PLANT DISEASE: Direct ML inference (demo)
// ─────────────────────────────────────────────

server.tool(
  "analyze_plant",
  "Analyze a plant/leaf image to detect diseases. Provide the absolute file path to a leaf or plant image on disk. DO NOT pass base64 data — just the file path. The tool reads the file directly. This is a FREE service. Identifies 38 plant diseases across crops like tomato, potato, corn, grape, apple, and more.",
  {
    filePath: z.string().describe("Absolute file path to a plant/leaf image (JPEG/PNG) on the user's computer, e.g. C:/Users/name/leaf.jpg"),
  },
  async ({ filePath }) => {
    try {
      const absPath = resolve(filePath);
      const fileBuffer = await readFile(absPath);
      const base64Data = fileBuffer.toString("base64");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(`${PLANT_DISEASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        return {
          content: [{
            type: "text",
            text: `Plant disease analysis failed (${response.status}): ${errText}`,
          }],
        };
      }

      const result = (await response.json()) as {
        diagnosis: string;
        confidence: number;
        predictions: { label: string; score: number }[];
        model: string;
        latency_ms: number;
      };

      const confidencePct = (result.confidence * 100).toFixed(1);

      // Determine if the plant is healthy or diseased
      const isHealthy = result.diagnosis.toLowerCase().includes("healthy");
      const statusEmoji = isHealthy ? "\u2705" : "\u26a0\ufe0f";
      const statusLabel = isHealthy ? "Healthy" : "Disease Detected";

      const text = [
        `${statusEmoji} **Plant Disease Analysis Result**`,
        "",
        `**Status: ${statusLabel}**`,
        `**Diagnosis: ${result.diagnosis}**`,
        `**Confidence: ${confidencePct}%**`,
        "",
        "**All predictions:**",
        ...result.predictions.slice(0, 10).map(
          (p) => `- ${p.label}: ${(p.score * 100).toFixed(1)}%`,
        ),
        result.predictions.length > 10 ? `- ... and ${result.predictions.length - 10} more` : "",
        "",
        `Model: ${result.model}`,
        `Inference time: ${result.latency_ms}ms`,
        "",
        "\ud83c\udf31 *This is an AI-assisted screening tool. Always consult a qualified agronomist for crop management decisions.*",
        "",
        `Powered by **Stoa AI Marketplace** \u2014 free service, no account required.`,
      ].filter(Boolean).join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return {
          content: [{
            type: "text",
            text: "Plant disease analysis timed out (90s). The HuggingFace Space may be cold-starting \u2014 try again in 30 seconds.",
          }],
        };
      }
      return {
        content: [{
          type: "text",
          text: `Plant disease analysis error: ${err?.message || err}`,
        }],
      };
    }
  },
);

// ─────────────────────────────────────────────
// PAID TOOL: call_service
// ─────────────────────────────────────────────

server.tool(
  "call_service",
  "Call a Stoa marketplace service. IMPORTANT: First use get_service_schema to check the required input format. Most ML models expect {\"inputs\": \"your text here\"}. Free services work without an account.",
  {
    serviceId: z.string().describe("Service ID from find_service results"),
    input: z.record(z.string(), z.unknown()).describe("Input JSON matching the service's inputSchema. Most HuggingFace models expect: {\"inputs\": \"text\"} for text, or {\"inputs\": {\"question\": \"...\", \"context\": \"...\"}} for QA"),
    maxSpendUsd: z.number().optional().describe("Maximum willing to spend in USD (safety guard)"),
  },
  async ({ serviceId, input, maxSpendUsd }) => {
    try {
      const { service } = await registry.getService(serviceId);

      // Spending guard
      if (maxSpendUsd && service.priceUsdcPerCall > maxSpendUsd) {
        return {
          content: [{
            type: "text",
            text: `Service costs $${service.priceUsdcPerCall}/call, which exceeds your limit of $${maxSpendUsd}. Increase maxSpendUsd or choose a cheaper service.`,
          }],
        };
      }

      // For paid services, require wallet key (or API key as fallback)
      const isPaid = Number(service.priceUsdcPerCall) > 0;
      if (isPaid && !paidFetch && !STOA_API_KEY) {
        return {
          content: [{
            type: "text",
            text: [
              `**${service.name}** costs $${service.priceUsdcPerCall}/call.`,
              "",
              "Add your wallet private key to the MCP config to enable on-chain payments:",
              '`"env": { "WALLET_PRIVATE_KEY": "0xYourPrivateKey" }`',
              "",
              "Export from MetaMask: Settings → Security → Export Private Key",
              "Fund with Base Sepolia USDC from https://faucet.circle.com/",
            ].join("\n"),
          }],
        };
      }

      const callUrl = registry.getCallUrl(serviceId);
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      // Wallet key takes priority for on-chain payments; API key is fallback
      const usePaidFetch = isPaid && paidFetch;
      if (!usePaidFetch && STOA_API_KEY) headers["X-Stoa-Key"] = STOA_API_KEY;
      const fetchFn = usePaidFetch ? paidFetch! : fetch;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetchFn(callUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        const schemaHint = service.inputSchema
          ? `\n\n**Expected input format:**\n\`\`\`json\n${JSON.stringify(service.inputSchema, null, 2)}\n\`\`\``
          : "";
        return {
          content: [{
            type: "text",
            text: `**${service.name}** call failed (${response.status}): ${errorBody}${schemaHint}\n\nRetry with the correct input format shown above.`,
          }],
        };
      }

      const result = (await response.json()) as {
        result: unknown;
        cost?: number;
        txHash?: string;
        basescanUrl?: string;
        latencyMs?: number;
        paidVia?: string;
        free?: boolean;
      };

      const costLine = result.free
        ? "Cost: Free"
        : `Cost: $${result.cost || service.priceUsdcPerCall} USDC`;
      const text = [
        `**${service.name}** — Call successful`,
        costLine,
        result.txHash ? `Transaction: ${result.basescanUrl || result.txHash}` : "",
        `Latency: ${result.latencyMs}ms`,
        "",
        "**Result:**",
        "```json",
        JSON.stringify(result.result, null, 2),
        "```",
      ].filter(Boolean).join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return { content: [{ type: "text", text: "Service call timed out (60s). The service may be cold-starting on HuggingFace — try again in 30 seconds." }] };
      }
      const errMsg = err?.message || String(err);
      const errDetails = err?.cause ? `\nCause: ${err.cause}` : "";
      const errStack = err?.stack ? `\nStack: ${err.stack.split("\n").slice(0, 3).join("\n")}` : "";
      return { content: [{ type: "text", text: `Call error: ${errMsg}${errDetails}${errStack}` }] };
    }
  },
);

// ─────────────────────────────────────────────
// WALLET TOOLS
// ─────────────────────────────────────────────

server.tool(
  "get_wallet_status",
  "Check your wallet address and payment method",
  {},
  async () => {
    // If user has a local wallet key, show that with real on-chain balance
    if (walletAddress) {
      const balance = await getUsdcBalance(walletAddress as `0x${string}`);
      const balanceText = balance >= 0 ? `${balance} USDC` : "Unable to fetch";
      const text = [
        `**Wallet Status (Local Key)**`,
        `Address: ${walletAddress}`,
        `Balance: ${balanceText}`,
        `Network: Base Sepolia`,
        `Payment: x402 on-chain (USDC signed automatically by your key)`,
        "",
        balance > 0
          ? "Wallet is funded and ready. You can call paid services directly."
          : "Fund with Base Sepolia USDC from https://faucet.circle.com/",
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }

    // Fall back to server-side wallet via API key
    const authErr = requireAuth();
    if (authErr) return authErr;

    try {
      const wallet = await registry.getWalletBalance();
      const text = [
        `**Wallet Status**`,
        `Address: ${wallet.address || "Not yet provisioned"}`,
        `Balance: ${wallet.balanceUsdc} USDC`,
        `Network: ${wallet.network}`,
        "",
        "To top up: Send USDC (Base Sepolia) to the address above, or visit stoa.ai/connect",
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Wallet error: ${err}` }] };
    }
  },
);

server.tool(
  "fund_wallet",
  "Get your wallet address and instructions for funding it with USDC",
  {},
  async () => {
    const address = walletAddress;

    if (!address) {
      // Fall back to server-side wallet
      const authErr = requireAuth();
      if (authErr) return authErr;

      try {
        const wallet = await registry.getWalletBalance();
        const text = [
          `**Fund Your Wallet**`,
          "",
          `Address: \`${wallet.address || "Not yet provisioned"}\``,
          `Current balance: ${wallet.balanceUsdc} USDC`,
          `Network: Base Sepolia (Chain ID: 84532)`,
          "",
          "**How to fund:**",
          "1. Send USDC on Base Sepolia to the address above",
          "2. Get testnet USDC from the Base Sepolia faucet",
          "3. Or visit stoa.ai/connect to top up with fiat",
          "",
          `USDC Contract: \`0x036CbD53842c5426634e7929541eC2318f3dCF7e\``,
        ].join("\n");
        return { content: [{ type: "text", text }] };
      } catch (err) {
        return { content: [{ type: "text", text: `Fund wallet error: ${err}` }] };
      }
    }

    const balance = await getUsdcBalance(address as `0x${string}`);
    const text = [
      `**Fund Your Wallet**`,
      "",
      `Address: \`${address}\``,
      `Current balance: ${balance >= 0 ? balance : "?"} USDC`,
      `Network: Base Sepolia (Chain ID: 84532)`,
      "",
      balance > 0
        ? "Wallet is already funded and ready to use for paid service calls."
        : [
          "**How to fund:**",
          "1. Get testnet USDC from https://faucet.circle.com/",
          "2. Select Base Sepolia network",
          "3. Enter your address above",
        ].join("\n"),
      "",
      `USDC Contract: \`0x036CbD53842c5426634e7929541eC2318f3dCF7e\``,
    ].join("\n");

    return { content: [{ type: "text", text }] };
  },
);

server.tool(
  "withdraw",
  "Withdraw USDC from your Stoa wallet to an external address",
  {
    toAddress: z.string().describe("Destination Ethereum address (0x...)"),
    amountUsdc: z.number().positive().describe("Amount of USDC to withdraw"),
  },
  async ({ toAddress, amountUsdc }) => {
    const authErr = requireAuth();
    if (authErr) return authErr;

    try {
      const result = await registry.withdraw(toAddress, amountUsdc);

      const text = [
        `**Withdrawal ${result.status === "completed" ? "Complete" : "Queued"}**`,
        `To: ${result.toAddress}`,
        `Amount: ${result.amountUsdc} USDC`,
        result.txHash ? `Transaction: https://sepolia.basescan.org/tx/${result.txHash}` : `Status: ${result.status}`,
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Withdrawal error: ${err}` }] };
    }
  },
);

server.tool(
  "get_usage",
  "View your recent Stoa service usage and spending",
  {
    limit: z.number().optional().describe("Number of recent transactions to show (default 5)"),
  },
  async ({ limit }) => {
    const authErr = requireAuth();
    if (authErr) return authErr;

    try {
      const [usage, txData] = await Promise.all([
        registry.getUsage(),
        registry.getTransactions(limit ?? 5),
      ]);

      const lines = [
        `**Usage Summary**`,
        `Total calls: ${usage.totalCalls}`,
        `Total spent: $${usage.totalSpentUsdc} USDC`,
        `Services used: ${usage.servicesUsed}`,
        "",
      ];

      if (txData.transactions.length > 0) {
        lines.push(`**Recent calls (${txData.transactions.length}):**`);
        txData.transactions.forEach((tx, i) => {
          const status = tx.success ? "Success" : "Failed";
          lines.push(`${i + 1}. $${tx.costUsdc} — ${status} — ${tx.latencyMs}ms`);
        });
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Usage error: ${err}` }] };
    }
  },
);

// ─────────────────────────────────────────────
// PROVIDER TOOLS: Service Management
// ─────────────────────────────────────────────

server.tool(
  "register_service",
  "Register a new AI service on the Stoa marketplace. You become the provider.",
  {
    name: z.string().describe("Service name (max 100 chars)"),
    description: z.string().describe("What this service does (10-2000 chars)"),
    capabilities: z.array(z.string()).describe("List of capabilities (e.g. ['sentiment analysis', 'multilingual'])"),
    category: z.string().describe("Category: medical, finance, legal, code, data, creative, research, security, agriculture, other"),
    serviceType: z.string().optional().describe("Type: ml-model, ai-agent, api-tool, data-feed, workflow (default: ml-model)"),
    priceUsdcPerCall: z.number().positive().describe("Price per call in USDC (e.g. 0.01)"),
    endpointUrl: z.string().describe("The HTTP endpoint URL that handles requests"),
    inputSchema: z.record(z.string(), z.unknown()).optional().describe("JSON Schema describing the input format"),
    outputSchema: z.record(z.string(), z.unknown()).optional().describe("JSON Schema describing the output format"),
  },
  async ({ name, description, capabilities, category, serviceType, priceUsdcPerCall, endpointUrl, inputSchema, outputSchema }) => {
    const authErr = requireAuth();
    if (authErr) return authErr;

    try {
      // Get user's wallet address for ownerAddress
      const wallet = await registry.getWalletAddress();
      const ownerAddress = wallet.address || "0x0000000000000000000000000000000000000000";

      const result = await registry.registerService({
        ownerAddress,
        name,
        description,
        capabilities,
        category,
        serviceType: serviceType || "ml-model",
        priceUsdcPerCall,
        endpointUrl,
        inputSchema: inputSchema || { type: "object", properties: {} },
        outputSchema: outputSchema || { type: "object", properties: {} },
      });

      const text = [
        `**Service Registered Successfully!**`,
        "",
        `Name: ${result.service.name}`,
        `ID: ${result.service.id}`,
        `Type: ${result.service.serviceType}`,
        `Price: $${result.service.priceUsdcPerCall}/call`,
        `Endpoint: ${endpointUrl}`,
        "",
        `Verification token: \`${result.verificationToken}\``,
        `To verify your endpoint is reachable, the system will ping it automatically.`,
        "",
        `Your service is now live on the Stoa marketplace!`,
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Registration error: ${err}` }] };
    }
  },
);

server.tool(
  "my_services",
  "List all services you own on the Stoa marketplace",
  {},
  async () => {
    const authErr = requireAuth();
    if (authErr) return authErr;

    try {
      const me = await registry.getMe();
      const services = await registry.listServices({ userId: me.id, limit: 50 });

      if (services.length === 0) {
        return { content: [{ type: "text", text: "You haven't registered any services yet. Use register_service to list one!" }] };
      }

      const lines = [`**Your Services (${services.length}):**\n`];
      services.forEach((s, i) => {
        const status = s.isActive ? "Active" : "Inactive";
        lines.push(`${i + 1}. **${s.name}** [${s.serviceType}] — $${s.priceUsdcPerCall}/call — ${status}`);
        lines.push(`   ${s.totalCalls} calls | ${s.successRate}% success`);
        lines.push(`   ID: ${s.id}`);
        lines.push("");
      });

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err}` }] };
    }
  },
);

server.tool(
  "update_service",
  "Update one of your services on the marketplace (price, description, active status, etc.)",
  {
    serviceId: z.string().describe("The service ID to update"),
    name: z.string().optional().describe("New service name"),
    description: z.string().optional().describe("New description"),
    priceUsdcPerCall: z.number().positive().optional().describe("New price per call in USDC"),
    endpointUrl: z.string().optional().describe("New endpoint URL"),
    isActive: z.boolean().optional().describe("Set active (true) or inactive (false)"),
  },
  async ({ serviceId, name, description, priceUsdcPerCall, endpointUrl, isActive }) => {
    const authErr = requireAuth();
    if (authErr) return authErr;

    try {
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (priceUsdcPerCall !== undefined) updateData.priceUsdcPerCall = priceUsdcPerCall;
      if (endpointUrl !== undefined) updateData.endpointUrl = endpointUrl;
      if (isActive !== undefined) updateData.isActive = isActive;

      const result = await registry.updateService(serviceId, updateData);

      const text = [
        `**Service Updated**`,
        `Name: ${result.service.name}`,
        `Price: $${result.service.priceUsdcPerCall}/call`,
        `Active: ${result.service.isActive ? "Yes" : "No"}`,
        `ID: ${result.service.id}`,
      ].join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Update error: ${err}` }] };
    }
  },
);

server.tool(
  "deactivate_service",
  "Deactivate one of your services (removes it from marketplace listings)",
  {
    serviceId: z.string().describe("The service ID to deactivate"),
  },
  async ({ serviceId }) => {
    const authErr = requireAuth();
    if (authErr) return authErr;

    try {
      const result = await registry.deactivateService(serviceId);
      return {
        content: [{
          type: "text",
          text: `Service ${result.serviceId} has been deactivated. It will no longer appear in search results or accept calls.`,
        }],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Deactivate error: ${err}` }] };
    }
  },
);

// ─────────────────────────────────────────────
// Start — stdio (CLI) or SSE (HTTP server)
// ─────────────────────────────────────────────

async function main() {
  const PORT = process.env.PORT;

  if (PORT) {
    // SSE mode — for ChatGPT, remote MCP clients, and deployments
    const { SSEServerTransport } = await import("@modelcontextprotocol/sdk/server/sse.js");
    const http = await import("node:http");
    const url = await import("node:url");

    let sseTransport: InstanceType<typeof SSEServerTransport> | null = null;

    const httpServer = http.createServer(async (req, res) => {
      // CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      const pathname = url.parse(req.url || "/").pathname;

      if (pathname === "/sse" && req.method === "GET") {
        // SSE connection endpoint
        sseTransport = new SSEServerTransport("/messages", res);
        await server.connect(sseTransport);
      } else if (pathname === "/messages" && req.method === "POST") {
        // Message endpoint
        if (sseTransport) {
          await sseTransport.handlePostMessage(req, res);
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No active SSE connection" }));
        }
      } else if (pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", transport: "sse", tools: 16 }));
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          name: "stoa-mcp-server",
          version: "1.0.0",
          transport: "sse",
          endpoints: { sse: "/sse", messages: "/messages", health: "/health" },
          docs: "Connect to /sse for MCP over Server-Sent Events",
        }));
      }
    });

    httpServer.listen(Number(PORT), () => {
      console.log(`Stoa MCP server (SSE) running on http://localhost:${PORT}/sse`);
    });
  } else {
    // stdio mode — for Claude Desktop / Cursor
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch(console.error);
