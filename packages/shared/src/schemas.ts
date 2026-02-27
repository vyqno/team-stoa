import { z } from "zod";
import { SERVICE_CATEGORIES, SERVICE_TYPES } from "./constants.js";

export const serviceCategorySchema = z.enum(SERVICE_CATEGORIES);

export const serviceTypeSchema = z.enum(SERVICE_TYPES);

export const jsonSchemaSchema = z.record(z.string(), z.unknown());

export const serviceRegistrationSchema = z.object({
  ownerAddress: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  capabilities: z.array(z.string()).min(1),
  category: serviceCategorySchema,
  serviceType: serviceTypeSchema.default("ml-model"),
  priceUsdcPerCall: z.number().nonnegative(),
  endpointUrl: z.string().url(),
  inputSchema: jsonSchemaSchema,
  outputSchema: jsonSchemaSchema,
  webhookUrl: z.string().url().optional(),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  category: serviceCategorySchema.optional(),
  limit: z.number().int().min(1).max(50).default(10),
});

export const userRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const topUpSchema = z.object({
  amountInr: z.number().positive().min(100),
});

export const withdrawSchema = z.object({
  toAddress: z.string().min(1),
  amountUsdc: z.number().positive(),
});

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z.string().regex(UUID_REGEX, "Invalid UUID format");
