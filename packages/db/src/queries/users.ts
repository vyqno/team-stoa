import { eq, and, isNull } from "drizzle-orm";
import { randomBytes, createHash } from "node:crypto";
import { db } from "../client.js";
import { users, apiKeys, topupTransactions } from "../schema.js";

export async function createUser(
  email: string,
  passwordHash: string,
  walletAddress?: string,
  cdpWalletId?: string,
) {
  const [row] = await db
    .insert(users)
    .values({ email, passwordHash, walletAddress, cdpWalletId })
    .returning();
  return row;
}

export async function getUserByEmail(email: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

export async function getUserByGoogleId(googleId: string) {
  const [row] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
  return row ?? null;
}

export async function createUserFromGoogle(data: {
  email: string;
  googleId: string;
  displayName?: string;
  avatarUrl?: string;
}) {
  const [row] = await db
    .insert(users)
    .values({
      email: data.email,
      googleId: data.googleId,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      passwordHash: null,
    })
    .returning();
  return row;
}

export async function updateUserProfile(
  userId: string,
  data: { displayName?: string; avatarUrl?: string; bio?: string },
) {
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getUserById(id: string) {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function updateUserWallet(userId: string, walletAddress: string, cdpWalletId: string) {
  await db
    .update(users)
    .set({ walletAddress, cdpWalletId })
    .where(eq(users.id, userId));
}

export async function getUserByApiKey(keyHash: string) {
  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!apiKey) return null;

  const [user] = await db.select().from(users).where(eq(users.id, apiKey.userId)).limit(1);
  return user ?? null;
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `stoa_${randomBytes(24).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}

export async function createApiKey(userId: string, label: string) {
  const { raw, hash, prefix } = generateApiKey();
  const [row] = await db
    .insert(apiKeys)
    .values({ userId, keyHash: hash, keyPrefix: prefix, label })
    .returning();
  return { key: raw, id: row.id };
}

export async function getUserApiKeys(userId: string) {
  return db
    .select({
      id: apiKeys.id,
      keyPrefix: apiKeys.keyPrefix,
      label: apiKeys.label,
      createdAt: apiKeys.createdAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));
}

export async function revokeApiKey(keyId: string) {
  await db.update(apiKeys).set({ revokedAt: new Date() }).where(eq(apiKeys.id, keyId));
}

export async function logTopUp(
  userId: string,
  amountInr: number,
  amountUsdc: number,
  razorpayOrderId?: string,
) {
  await db.insert(topupTransactions).values({
    userId,
    amountInr: String(amountInr),
    amountUsdc: String(amountUsdc),
    razorpayOrderId,
    status: "completed",
  });
}

export async function getTopupHistory(userId: string, limit = 20) {
  const { desc } = await import("drizzle-orm");
  return db
    .select()
    .from(topupTransactions)
    .where(eq(topupTransactions.userId, userId))
    .orderBy(desc(topupTransactions.createdAt))
    .limit(limit);
}
