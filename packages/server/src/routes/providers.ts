import { Hono } from "hono";
import jwt from "jsonwebtoken";
import { UUID_REGEX } from "@stoa/shared";
import { getUserById, listServices, getProviderStats, updateUserProfile } from "@stoa/db";

const JWT_SECRET = process.env.JWT_SECRET || "stoa-dev-secret";

export const providersRouter = new Hono();

// GET /api/providers/:userId — public profile + stats
providersRouter.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  if (!UUID_REGEX.test(userId)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }

  const user = await getUserById(userId);
  if (!user) {
    return c.json({ error: "Provider not found" }, 404);
  }

  const stats = await getProviderStats(userId);

  return c.json({
    provider: {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    },
    stats,
  });
});

// GET /api/providers/:userId/services — services by this provider
providersRouter.get("/:userId/services", async (c) => {
  const userId = c.req.param("userId");
  if (!UUID_REGEX.test(userId)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }

  const sort = c.req.query("sort") as "newest" | "popular" | "cheapest" | undefined;
  const limit = Number(c.req.query("limit") || "20");

  const services = await listServices({ userId, sort: sort || "newest", limit });

  return c.json({ services, count: services.length });
});

// PUT /api/providers/me — update own profile (auth required)
providersRouter.put("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  let userId: string;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { userId: string };
    userId = payload.userId;
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }

  const body = await c.req.json();
  const { displayName, avatarUrl, bio } = body;

  await updateUserProfile(userId, {
    displayName: displayName ?? undefined,
    avatarUrl: avatarUrl ?? undefined,
    bio: bio ?? undefined,
  });

  const user = await getUserById(userId);
  return c.json({
    id: user!.id,
    displayName: user!.displayName,
    avatarUrl: user!.avatarUrl,
    bio: user!.bio,
  });
});
