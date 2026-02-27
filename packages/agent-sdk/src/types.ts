export const SERVICE_CATEGORIES = [
  "medical",
  "finance",
  "legal",
  "code",
  "data",
  "creative",
  "research",
  "security",
  "agriculture",
  "other",
] as const;

export const SERVICE_TYPES = [
  "ml-model",
  "ai-agent",
  "api-tool",
  "data-feed",
  "workflow",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type JsonSchema = Record<string, unknown>;

export interface Service {
  id: string;
  ownerAddress: string;
  name: string;
  description: string;
  capabilities: string[];
  category: ServiceCategory;
  serviceType: ServiceType;
  priceUsdcPerCall: number;
  endpointUrl: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  isActive: boolean;
  isVerified: boolean;
  metadataHash: string;
  webhookUrl?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  services: Service[];
  query: string;
  totalCount: number;
}

export interface WalletInfo {
  address: string | null;
  balanceUsdc: number;
  network: string;
}

export interface UsageStats {
  totalCalls: number;
  totalSpentUsdc: number;
  servicesUsed: number;
}

export interface ProviderProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

export interface ProviderStats {
  totalServices: number;
  totalEarnings: number;
  totalCalls: number;
}

export interface ActivityEntry {
  id: string;
  serviceName: string;
  serviceId: string;
  callerAddress: string;
  costUsdc: number;
  success: boolean;
  latencyMs: number;
  txHash: string | null;
  basescanUrl: string | null;
  createdAt: Date;
}
