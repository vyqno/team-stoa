import type { SERVICE_CATEGORIES, SERVICE_TYPES } from "./constants.js";

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

export interface ServiceRegistration {
  ownerAddress: string;
  name: string;
  description: string;
  capabilities: string[];
  category: ServiceCategory;
  serviceType?: ServiceType;
  priceUsdcPerCall: number;
  endpointUrl: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  webhookUrl?: string;
}

export interface SearchResult {
  services: Service[];
  query: string;
  totalCount: number;
}

export interface CallResult {
  result: unknown;
  txHash: string;
  cost: number;
  latencyMs: number;
  basescanUrl: string;
}

export interface User {
  id: string;
  email: string;
  walletAddress: string | null;
  cdpWalletId?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
  bio?: string | null;
  createdAt: Date;
}

export interface ProviderStats {
  totalServices: number;
  totalEarnings: number;
  totalCalls: number;
}

export interface ApiKey {
  id: string;
  userId: string;
  keyHash: string;
  label: string;
  createdAt: Date;
  revokedAt?: Date;
}

export interface WalletInfo {
  address: string;
  balanceUsdc: number;
  network: string;
}

export interface TopUpTransaction {
  id: string;
  userId: string;
  amountInr: number;
  amountUsdc: number;
  razorpayOrderId?: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

export interface CallLog {
  id: string;
  serviceId: string;
  userId?: string;
  callerAddress: string;
  costUsdc: number;
  txHash: string;
  basescanUrl: string;
  latencyMs: number;
  success: boolean;
  createdAt: Date;
}

export interface UsageStats {
  totalCalls: number;
  totalSpentUsdc: number;
  servicesUsed: number;
}

export interface WebhookPayload {
  event: "service_called";
  service: string;
  cost: number;
  caller: string;
  txHash: string;
  basescanUrl: string;
  timestamp: string;
}
