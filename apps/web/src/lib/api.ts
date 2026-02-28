const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("stoa_token") : null;
  const apiKey =
    typeof window !== "undefined" ? localStorage.getItem("stoa_api_key") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (apiKey) headers["X-Stoa-Key"] = apiKey;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Auth ──
export const auth = {
  register: (email: string, password: string) =>
    request<{ token: string; user: any; apiKey: string; message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<any>("/api/auth/me"),
  google: (accessToken: string) =>
    request<{ token: string; user: any; apiKey?: string }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    }),
};

// ── Services ──
export const services = {
  list: (params?: {
    category?: string;
    serviceType?: string;
    sort?: string;
    limit?: number;
    offset?: number;
    userId?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) qs.set(k, String(v));
      });
    }
    return request<{ services: any[]; count: number }>(
      `/api/services?${qs.toString()}`
    );
  },
  get: (id: string) =>
    request<{ service: any; provider: any; recentCalls: any[] }>(
      `/api/services/${id}`
    ),
  search: (query: string, category?: string, limit?: number) =>
    request<{ services: any[]; query: string; totalCount: number }>(
      "/api/services/search",
      {
        method: "POST",
        body: JSON.stringify({ query, category, limit }),
      }
    ),
  register: (data: any) =>
    request<{ service: any; verificationToken: string; verifyUrl: string }>(
      "/api/services",
      { method: "POST", body: JSON.stringify(data) }
    ),
  update: (id: string, data: any) =>
    request<{ service: any }>(`/api/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ deactivated: boolean }>(`/api/services/${id}`, {
      method: "DELETE",
    }),
  metrics: (id: string, data: any) =>
    request<{ logged: boolean }>(`/api/services/${id}/metrics`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Wallet ──
export const wallet = {
  balance: () =>
    request<{ address: string | null; balanceUsdc: number; network: string; message?: string }>(
      "/api/wallet/balance"
    ),
  link: (address: string) =>
    request<{ address: string; message: string }>("/api/wallet/link", {
      method: "POST",
      body: JSON.stringify({ walletAddress: address }),
    }),
  address: () =>
    request<{ address: string | null; message: string }>("/api/wallet/address"),
  transactions: (limit?: number) =>
    request<{ transactions: any[] }>(
      `/api/wallet/transactions?limit=${limit || 20}`
    ),
  usage: () =>
    request<{ totalCalls: number; totalSpentUsdc: number; servicesUsed: number }>(
      "/api/wallet/usage"
    ),
  withdraw: (toAddress: string, amountUsdc: number) =>
    request<any>("/api/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ toAddress, amountUsdc }),
    }),
};

// ── Activity ──
export const activity = {
  list: (limit?: number) =>
    request<{ activity: any[]; count: number }>(
      `/api/activity?limit=${limit || 20}`
    ),
};

// ── Providers ──
export const providers = {
  get: (userId: string) =>
    request<{ provider: any; stats: any }>(`/api/providers/${userId}`),
  services: (userId: string) =>
    request<{ services: any[]; count: number }>(
      `/api/providers/${userId}/services`
    ),
  updateMe: (data: { displayName?: string; avatarUrl?: string; bio?: string }) =>
    request<any>("/api/providers/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
