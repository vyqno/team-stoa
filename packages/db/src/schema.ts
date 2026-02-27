import {
  pgTable,
  uuid,
  text,
  varchar,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  vector,
  index,
} from "drizzle-orm/pg-core";

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerAddress: varchar("owner_address", { length: 42 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    capabilities: jsonb("capabilities").$type<string[]>().notNull(),
    category: varchar("category", { length: 20 }).notNull(),
    serviceType: varchar("service_type", { length: 20 }).notNull().default("ml-model"),
    priceUsdcPerCall: numeric("price_usdc_per_call", { precision: 18, scale: 6 }).notNull(),
    endpointUrl: text("endpoint_url").notNull(),
    inputSchema: jsonb("input_schema").$type<Record<string, unknown>>().notNull(),
    outputSchema: jsonb("output_schema").$type<Record<string, unknown>>().notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    totalCalls: integer("total_calls").default(0).notNull(),
    successRate: numeric("success_rate", { precision: 5, scale: 2 }).default("100.00").notNull(),
    avgLatencyMs: integer("avg_latency_ms").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    metadataHash: varchar("metadata_hash", { length: 66 }).default("").notNull(),
    webhookUrl: text("webhook_url"),
    userId: uuid("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("services_category_idx").on(table.category),
    index("services_owner_idx").on(table.ownerAddress),
    index("services_active_idx").on(table.isActive),
    index("services_type_idx").on(table.serviceType),
  ],
);

export const callLogs = pgTable(
  "call_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    serviceId: uuid("service_id")
      .references(() => services.id)
      .notNull(),
    userId: uuid("user_id").references(() => users.id),
    callerAddress: varchar("caller_address", { length: 42 }).notNull(),
    costUsdc: numeric("cost_usdc", { precision: 18, scale: 6 }).notNull(),
    txHash: varchar("tx_hash", { length: 66 }),
    latencyMs: integer("latency_ms").notNull(),
    success: boolean("success").notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("call_logs_service_idx").on(table.serviceId),
    index("call_logs_user_idx").on(table.userId),
    index("call_logs_created_idx").on(table.createdAt),
  ],
);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash"),
  walletAddress: varchar("wallet_address", { length: 42 }),
  cdpWalletId: text("cdp_wallet_id"),
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  googleId: varchar("google_id", { length: 100 }).unique(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    keyHash: varchar("key_hash", { length: 64 }).unique().notNull(),
    keyPrefix: varchar("key_prefix", { length: 12 }).notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (table) => [index("api_keys_user_idx").on(table.userId)],
);

export const topupTransactions = pgTable(
  "topup_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    amountInr: numeric("amount_inr", { precision: 12, scale: 2 }).notNull(),
    amountUsdc: numeric("amount_usdc", { precision: 18, scale: 6 }).notNull(),
    razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("topup_user_idx").on(table.userId)],
);
