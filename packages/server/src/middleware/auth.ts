import { createHash } from "node:crypto";
import type { Context, Next } from "hono";
import { getUserByApiKey } from "@stoa/db";

export interface AuthUser {
  id: string;
  email: string;
  walletAddress: string | null;
  cdpWalletId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export async function authenticateApiKey(c: Context, next: Next) {
  const apiKey = c.req.header("X-Stoa-Key");

  if (!apiKey) {
    return c.json({ error: "Missing X-Stoa-Key header" }, 401);
  }

  const keyHash = createHash("sha256").update(apiKey).digest("hex");
  const user = await getUserByApiKey(keyHash);

  if (!user) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  c.set("user", {
    id: user.id,
    email: user.email,
    walletAddress: user.walletAddress,
    cdpWalletId: user.cdpWalletId,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  } satisfies AuthUser);

  await next();
}

export function getAuthUser(c: Context): AuthUser {
  return c.get("user") as AuthUser;
}
