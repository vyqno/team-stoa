export class RegistryClient {
  constructor(
    private apiUrl: string,
    private apiKey?: string,
  ) {}

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) h["X-Stoa-Key"] = this.apiKey;
    return h;
  }

  async search(query: string, opts?: { category?: string; serviceType?: string; limit?: number }) {
    const res = await fetch(`${this.apiUrl}/api/services/search`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ query, ...opts }),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
    const data = (await res.json()) as { services: ServiceResponse[] };
    return data.services;
  }

  async getService(id: string) {
    const res = await fetch(`${this.apiUrl}/api/services/${id}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Get service failed: ${res.statusText}`);
    const data = (await res.json()) as { service: ServiceResponse; provider?: ProviderInfo };
    return data;
  }

  async listServices(opts?: { category?: string; serviceType?: string; sort?: string; limit?: number; userId?: string }) {
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
    const data = (await res.json()) as { services: ServiceResponse[] };
    return data.services;
  }

  async registerService(data: RegisterServiceData) {
    const res = await fetch(`${this.apiUrl}/api/services`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Register failed (${res.status}): ${error}`);
    }
    return (await res.json()) as { service: ServiceResponse; verificationToken: string };
  }

  async updateService(id: string, data: Partial<RegisterServiceData> & { isActive?: boolean }) {
    const res = await fetch(`${this.apiUrl}/api/services/${id}`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Update failed (${res.status}): ${error}`);
    }
    return (await res.json()) as { service: ServiceResponse };
  }

  async deactivateService(id: string) {
    const res = await fetch(`${this.apiUrl}/api/services/${id}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Deactivate failed (${res.status}): ${error}`);
    }
    return (await res.json()) as { deactivated: boolean; serviceId: string };
  }

  async getMe() {
    const res = await fetch(`${this.apiUrl}/api/auth/me`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Auth failed: ${res.statusText}`);
    return (await res.json()) as { id: string; email: string; walletAddress: string | null };
  }

  async getWalletBalance() {
    const res = await fetch(`${this.apiUrl}/api/wallet/balance`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Balance check failed: ${res.statusText}`);
    return res.json() as Promise<{ address: string | null; balanceUsdc: number; network: string }>;
  }

  async getWalletAddress() {
    const res = await fetch(`${this.apiUrl}/api/wallet/address`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Address check failed: ${res.statusText}`);
    return res.json() as Promise<{ address: string | null; message: string }>;
  }

  async withdraw(toAddress: string, amountUsdc: number) {
    const res = await fetch(`${this.apiUrl}/api/wallet/withdraw`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ toAddress, amountUsdc }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Withdraw failed (${res.status}): ${error}`);
    }
    return res.json() as Promise<{ message: string; toAddress: string; amountUsdc: number; txHash: string | null; status: string }>;
  }

  async getUsage() {
    const res = await fetch(`${this.apiUrl}/api/wallet/usage`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Usage check failed: ${res.statusText}`);
    return res.json() as Promise<{ totalCalls: number; totalSpentUsdc: number; servicesUsed: number }>;
  }

  async getTransactions(limit = 10) {
    const res = await fetch(`${this.apiUrl}/api/wallet/transactions?limit=${limit}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Transactions fetch failed: ${res.statusText}`);
    return res.json() as Promise<{ transactions: TransactionResponse[] }>;
  }

  async getActivity(limit = 20) {
    const res = await fetch(`${this.apiUrl}/api/activity?limit=${limit}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Activity fetch failed: ${res.statusText}`);
    return res.json() as Promise<{ activity: ActivityResponse[]; count: number }>;
  }

  async getProvider(userId: string) {
    const res = await fetch(`${this.apiUrl}/api/providers/${userId}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Provider fetch failed: ${res.statusText}`);
    return res.json() as Promise<{ provider: ProviderInfo; stats: ProviderStats }>;
  }

  async getProviderServices(userId: string, limit = 20) {
    const res = await fetch(`${this.apiUrl}/api/providers/${userId}/services?limit=${limit}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Provider services failed: ${res.statusText}`);
    return res.json() as Promise<{ services: ServiceResponse[]; count: number }>;
  }

  async register(email: string, password: string, displayName?: string) {
    const res = await fetch(`${this.apiUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Registration failed (${res.status}): ${error}`);
    }
    return res.json() as Promise<{ user: { id: string; email: string; walletAddress: string | null }; apiKey: string; message: string }>;
  }

  async login(email: string, password: string) {
    const res = await fetch(`${this.apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Login failed (${res.status}): ${error}`);
    }
    return res.json() as Promise<{ token: string; user: { id: string; email: string; walletAddress: string | null } }>;
  }

  getCallUrl(serviceId: string) {
    return `${this.apiUrl}/v1/call/${serviceId}`;
  }
}

interface ServiceResponse {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  category: string;
  serviceType: string;
  priceUsdcPerCall: number;
  endpointUrl: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  isVerified: boolean;
  isActive: boolean;
  userId?: string;
  similarity?: number;
}

interface RegisterServiceData {
  ownerAddress: string;
  name: string;
  description: string;
  capabilities: string[];
  category: string;
  serviceType?: string;
  priceUsdcPerCall: number;
  endpointUrl: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  webhookUrl?: string;
}

interface TransactionResponse {
  id: string;
  serviceId: string;
  costUsdc: number;
  success: boolean;
  latencyMs: number;
  txHash: string | null;
  createdAt: string;
}

interface ActivityResponse {
  id: string;
  serviceName: string;
  serviceId: string;
  callerAddress: string;
  costUsdc: number;
  success: boolean;
  latencyMs: number;
  txHash: string | null;
  basescanUrl: string | null;
  createdAt: string;
}

interface ProviderInfo {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  email?: string;
  createdAt?: string;
}

interface ProviderStats {
  totalServices: number;
  totalEarnings: number;
  totalCalls: number;
}
