import { Hono } from "hono";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  userRegistrationSchema,
  loginSchema,
} from "@stoa/shared";
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByGoogleId,
  createUserFromGoogle,
  createApiKey,
  updateUserWallet,
} from "@stoa/db";
import { supabase } from "../lib/supabase.js";
import { createCdpWallet } from "../lib/cdp-wallet.js";

const JWT_SECRET = process.env.JWT_SECRET || "stoa-dev-secret";
const SALT_ROUNDS = 10;

export const authRouter = new Hono();

// POST /api/auth/register
authRouter.post("/register", async (c) => {
  const body = await c.req.json();
  const parsed = userRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.issues }, 400);
  }

  const { email, password } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return c.json({ error: "Email already registered" }, 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser(email, passwordHash);

  // Generate API key
  const { key: apiKey } = await createApiKey(user.id, "default");

  // Create CDP wallet
  const wallet = await createCdpWallet(user.id);
  if (wallet) {
    await updateUserWallet(user.id, wallet.address, wallet.walletId);
    user.walletAddress = wallet.address;
    user.cdpWalletId = wallet.walletId;
  }

  return c.json(
    {
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
      },
      apiKey, // Only returned once
      message: "Save your API key — it won't be shown again",
    },
    201,
  );
});

// POST /api/auth/login
authRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.issues }, 400);
  }

  const { email, password } = parsed.data;

  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
    },
  });
});

// GET /api/auth/me — supports both JWT and API key
authRouter.get("/me", async (c) => {
  const formatUser = (user: NonNullable<Awaited<ReturnType<typeof getUserById>>>) => ({
    id: user.id,
    email: user.email,
    walletAddress: user.walletAddress,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  });

  // Try JWT first
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: string };
      const user = await getUserById(payload.userId);
      if (user) return c.json(formatUser(user));
    } catch {
      // fall through to API key check
    }
  }

  // Try API key
  const apiKey = c.req.header("X-Stoa-Key");
  if (apiKey) {
    const { createHash } = await import("node:crypto");
    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const { getUserByApiKey } = await import("@stoa/db");
    const user = await getUserByApiKey(keyHash);
    if (user) return c.json(formatUser(user));
  }

  return c.json({ error: "Not authenticated" }, 401);
});

// POST /api/auth/google — Google OAuth via Supabase
authRouter.post("/google", async (c) => {
  if (!supabase) {
    return c.json({ error: "Google OAuth not configured" }, 503);
  }

  const { accessToken } = await c.req.json();
  if (!accessToken) {
    return c.json({ error: "Missing accessToken" }, 400);
  }

  // Validate token with Supabase
  const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(accessToken);
  if (error || !supabaseUser) {
    return c.json({ error: "Invalid access token" }, 401);
  }

  const email = supabaseUser.email;
  const googleId = supabaseUser.user_metadata?.sub || supabaseUser.id;
  const displayName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name;
  const avatarUrl = supabaseUser.user_metadata?.avatar_url;

  if (!email) {
    return c.json({ error: "No email associated with Google account" }, 400);
  }

  // Check if user exists by googleId
  let user = await getUserByGoogleId(googleId);
  let apiKey: string | undefined;
  let isNewUser = false;

  if (!user) {
    // Check by email (user may have registered with email/password before)
    const existingByEmail = await getUserByEmail(email);
    if (existingByEmail) {
      // Link Google account to existing user — not implemented for hackathon simplicity
      // Just return as existing user
      user = existingByEmail;
    } else {
      // Create new user
      user = await createUserFromGoogle({ email, googleId, displayName, avatarUrl });
      const { key } = await createApiKey(user.id, "default");
      apiKey = key;
      isNewUser = true;
    }
  }

  // Create CDP wallet if not provisioned
  if (!user.walletAddress) {
    const wallet = await createCdpWallet(user.id);
    if (wallet) {
      await updateUserWallet(user.id, wallet.address, wallet.walletId);
      user.walletAddress = wallet.address;
      user.cdpWalletId = wallet.walletId;
    }
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const response: Record<string, unknown> = {
    token,
    user: {
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  };

  if (apiKey) {
    response.apiKey = apiKey;
    response.message = "Save your API key — it won't be shown again";
  }

  return c.json(response, isNewUser ? 201 : 200);
});
