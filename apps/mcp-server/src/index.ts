#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RegistryClient } from "./lib/registry-client.js";

const STOA_API_URL = process.env.STOA_API_URL || "https://stoa-api.up.railway.app";
const STOA_API_KEY = process.env.STOA_API_KEY;

const registry = new RegistryClient(STOA_API_URL, STOA_API_KEY);

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
// PAID TOOL: call_service
// ─────────────────────────────────────────────

server.tool(
  "call_service",
  "Call a paid Stoa marketplace service. Payment is handled automatically via your wallet.",
  {
    serviceId: z.string().describe("Service ID from find_service results"),
    input: z.record(z.string(), z.unknown()).describe("Input data matching the service's input schema"),
    maxSpendUsd: z.number().optional().describe("Maximum willing to spend in USD (safety guard)"),
  },
  async ({ serviceId, input, maxSpendUsd }) => {
    try {
      const { service } = await registry.getService(serviceId);

      if (maxSpendUsd && service.priceUsdcPerCall > maxSpendUsd) {
        return {
          content: [{
            type: "text",
            text: `Service costs $${service.priceUsdcPerCall}/call, which exceeds your limit of $${maxSpendUsd}. Increase maxSpendUsd or choose a cheaper service.`,
          }],
        };
      }

      const callUrl = registry.getCallUrl(serviceId);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (STOA_API_KEY) headers["X-Stoa-Key"] = STOA_API_KEY;

      const response = await fetch(callUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });

      if (response.status === 402) {
        return {
          content: [{
            type: "text",
            text: `Payment required for ${service.name} ($${service.priceUsdcPerCall}). Your wallet may have insufficient balance. Use fund_wallet to see your address and top up.`,
          }],
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        return { content: [{ type: "text", text: `Service call failed (${response.status}): ${errorText}` }] };
      }

      const result = (await response.json()) as {
        result: unknown;
        cost?: number;
        txHash?: string;
        basescanUrl?: string;
        latencyMs?: number;
      };

      const text = [
        `**${service.name}** — Call successful`,
        `Cost: $${result.cost || service.priceUsdcPerCall} USDC`,
        result.txHash ? `Transaction: ${result.basescanUrl || result.txHash}` : "",
        `Latency: ${result.latencyMs}ms`,
        "",
        "**Result:**",
        "```json",
        JSON.stringify(result.result, null, 2),
        "```",
      ].filter(Boolean).join("\n");

      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Call error: ${err}` }] };
    }
  },
);

// ─────────────────────────────────────────────
// WALLET TOOLS
// ─────────────────────────────────────────────

server.tool(
  "get_wallet_status",
  "Check your Stoa wallet balance and address",
  {},
  async () => {
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
// Start
// ─────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
