import type { ActivityEntry, ProviderProfile, ProviderStats } from "./types.js";

export interface StoaClientConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface ServiceResult {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  category: string;
  serviceType: string;
  priceUsdcPerCall: number;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  isVerified: boolean;
  isActive: boolean;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  userId?: string;
  similarity?: number;
}

export interface CallOptions {
  maxSpendUsd?: number;
}

export interface CallResult {
  result: unknown;
  cost: number;
  txHash: string;
  basescanUrl: string;
  latencyMs: number;
}

export interface RegisterServiceInput {
  name: string;
  description: string;
  capabilities: string[];
  category: string;
  serviceType?: string;
  priceUsdcPerCall: number;
  endpointUrl: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  webhookUrl?: string;
}

export interface RegisterServiceResult {
  service: ServiceResult;
  verificationToken: string;
}

export class StoaClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: StoaClientConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || "https://stoa-api.up.railway.app";
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "X-Stoa-Key": this.apiKey,
    };
  }

  // ─────────────────────────────────────────────
  // Discovery
  // ─────────────────────────────────────────────

  async search(query: string, opts?: { category?: string; serviceType?: string; limit?: number }): Promise<ServiceResult[]> {
    const res = await fetch(`${this.apiUrl}/api/services/search`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ query, ...opts }),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
    const data = (await res.json()) as { services: ServiceResult[] };
    return data.services;
  }

  async listServices(opts?: { category?: string; serviceType?: string; sort?: string; limit?: number; userId?: string }): Promise<ServiceResult[]> {
    const params = new URLSearchParams();
    if (opts?.category) params.set("category", opts.category);
    if (opts?.serviceType) params.set("serviceType", opts.serviceType);
    if (opts?.sort) params.set("sort", opts.sort);
    if (opts?.limit) params.set("limit", String(opts.limit));
    if (opts?.userId) params.set("userId", opts.userId);

    const res = await fetch(`${this.apiUrl}/api/services?${params}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`List failed: ${res.statusText}`);
    const data = (await res.json()) as { services: ServiceResult[] };
    return data.services;
  }

  async getService(id: string): Promise<ServiceResult> {
    const res = await fetch(`${this.apiUrl}/api/services/${id}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Get service failed: ${res.statusText}`);
    const data = (await res.json()) as { service: ServiceResult };
    return data.service;
  }

  async getActivity(limit = 20): Promise<ActivityEntry[]> {
    const res = await fetch(`${this.apiUrl}/api/activity?limit=${limit}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Activity fetch failed: ${res.statusText}`);
    const data = (await res.json()) as { activity: ActivityEntry[] };
    return data.activity;
  }

  async getProvider(userId: string): Promise<{ provider: ProviderProfile; stats: ProviderStats }> {
    const res = await fetch(`${this.apiUrl}/api/providers/${userId}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Provider fetch failed: ${res.statusText}`);
    return (await res.json()) as { provider: ProviderProfile; stats: ProviderStats };
  }

  // ─────────────────────────────────────────────
  // Call
  // ─────────────────────────────────────────────

  async call(serviceId: string, input: Record<string, unknown>, opts?: CallOptions): Promise<CallResult> {
    if (opts?.maxSpendUsd) {
      const service = await this.getService(serviceId);
      if (service.priceUsdcPerCall > opts.maxSpendUsd) {
        throw new Error(
          `Service costs $${service.priceUsdcPerCall}/call, exceeds limit of $${opts.maxSpendUsd}`,
        );
      }
    }

    const res = await fetch(`${this.apiUrl}/v1/call/${serviceId}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(input),
    });

    if (res.status === 402) {
      throw new Error("Payment required. Your wallet may have insufficient balance.");
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Service call failed (${res.status}): ${errorText}`);
    }

    return (await res.json()) as CallResult;
  }

  // ─────────────────────────────────────────────
  // Provider / Service Management
  // ─────────────────────────────────────────────

  async registerService(data: RegisterServiceInput): Promise<RegisterServiceResult> {
    // Get own wallet address for ownerAddress
    const walletInfo = await this.getWalletAddress();
    const ownerAddress = walletInfo || "0x0000000000000000000000000000000000000000";

    const res = await fetch(`${this.apiUrl}/api/services`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        ...data,
        ownerAddress,
        serviceType: data.serviceType || "ml-model",
        inputSchema: data.inputSchema || { type: "object", properties: {} },
        outputSchema: data.outputSchema || { type: "object", properties: {} },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Registration failed (${res.status}): ${error}`);
    }

    return (await res.json()) as RegisterServiceResult;
  }

  async updateService(serviceId: string, data: Partial<RegisterServiceInput> & { isActive?: boolean }): Promise<ServiceResult> {
    const res = await fetch(`${this.apiUrl}/api/services/${serviceId}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Update failed (${res.status}): ${error}`);
    }

    const result = (await res.json()) as { service: ServiceResult };
    return result.service;
  }

  async deactivateService(serviceId: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/api/services/${serviceId}`, {
      method: "DELETE",
      headers: this.headers(),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Deactivate failed (${res.status}): ${error}`);
    }
  }

  async myServices(): Promise<ServiceResult[]> {
    const me = await this.getMe();
    return this.listServices({ userId: me.id, limit: 50 });
  }

  async getMe(): Promise<{ id: string; email: string; walletAddress: string | null }> {
    const res = await fetch(`${this.apiUrl}/api/auth/me`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Auth failed: ${res.statusText}`);
    return (await res.json()) as { id: string; email: string; walletAddress: string | null };
  }

  // ─────────────────────────────────────────────
  // Wallet
  // ─────────────────────────────────────────────

  async getBalance(): Promise<{ address: string | null; balanceUsdc: number; network: string }> {
    const res = await fetch(`${this.apiUrl}/api/wallet/balance`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Balance check failed: ${res.statusText}`);
    return (await res.json()) as { address: string | null; balanceUsdc: number; network: string };
  }

  async getWalletAddress(): Promise<string | null> {
    const balance = await this.getBalance();
    return balance.address;
  }

  async withdraw(toAddress: string, amountUsdc: number): Promise<{ txHash: string | null; status: string }> {
    const res = await fetch(`${this.apiUrl}/api/wallet/withdraw`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ toAddress, amountUsdc }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Withdrawal failed (${res.status}): ${error}`);
    }
    return (await res.json()) as { txHash: string | null; status: string };
  }

  async getTransactions(opts?: { limit?: number }) {
    const limit = opts?.limit ?? 20;
    const res = await fetch(`${this.apiUrl}/api/wallet/transactions?limit=${limit}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Transactions failed: ${res.statusText}`);
    return (await res.json()) as { transactions: TransactionResult[] };
  }

  async getUsage(): Promise<{ totalCalls: number; totalSpentUsdc: number; servicesUsed: number }> {
    const res = await fetch(`${this.apiUrl}/api/wallet/usage`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Usage check failed: ${res.statusText}`);
    return (await res.json()) as { totalCalls: number; totalSpentUsdc: number; servicesUsed: number };
  }
}

interface TransactionResult {
  id: string;
  serviceId: string;
  costUsdc: number;
  success: boolean;
  latencyMs: number;
  txHash: string | null;
  createdAt: string;
}
