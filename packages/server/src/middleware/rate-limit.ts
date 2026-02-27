import type { Context, Next } from "hono";

// In-memory rate limiter (no Redis dependency needed for hackathon)
// Tracks requests per key within a sliding window
const windows = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of windows) {
    if (val.resetAt < now) windows.delete(key);
  }
}, 5 * 60 * 1000);

function getKey(c: Context, prefix: string): string {
  const apiKey = c.req.header("X-Stoa-Key");
  if (apiKey) return `${prefix}:key:${apiKey.slice(0, 12)}`;

  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip") ||
    "unknown";
  return `${prefix}:ip:${ip}`;
}

function createLimiter(maxRequests: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    const key = getKey(c, c.req.path);
    const now = Date.now();

    const entry = windows.get(key);
    if (!entry || entry.resetAt < now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", String(maxRequests - 1));
      await next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfter));
      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", "0");
      return c.json(
        { error: "Too many requests", retryAfter },
        429
      );
    }

    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header("X-RateLimit-Remaining", String(maxRequests - entry.count));
    await next();
  };
}

// Pre-built limiters for different route groups
export const registryLimit = createLimiter(100, 60_000);    // 100/min
export const proxyLimit = createLimiter(60, 60_000);         // 60/min
export const searchLimit = createLimiter(30, 60_000);        // 30/min
export const authLimit = createLimiter(10, 60_000);          // 10/min
