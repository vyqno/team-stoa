import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });

// Dynamic imports AFTER dotenv loads — critical because @stoa/db reads DATABASE_URL at import time
const { Hono } = await import("hono");
const { cors } = await import("hono/cors");
const { serve } = await import("@hono/node-server");
const { servicesRouter } = await import("./routes/services.js");
const { authRouter } = await import("./routes/auth.js");
const { walletRouter } = await import("./routes/wallet.js");
const { callRouter } = await import("./routes/call.js");
const { providersRouter } = await import("./routes/providers.js");
const { activityRouter } = await import("./routes/activity.js");
const { topupRouter } = await import("./routes/topup.js");
const { digitalTwinRouter } = await import("./routes/digital-twin.js");
const { demoRouter } = await import("./routes/demo.js");
const { initializeFacilitator } = await import("./lib/facilitator.js");
const app = new Hono();

app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// NOTE: rate limiting disabled in dev — enable in production with Redis-backed limiter
// Route order matters: more specific routes first
app.route("/api/wallet/topup", topupRouter);
app.route("/api/wallet", walletRouter);
app.route("/api/services", servicesRouter);
app.route("/api/auth", authRouter);
app.route("/api/providers", providersRouter);
app.route("/api/activity", activityRouter);
app.route("/api/digital-twin", digitalTwinRouter);
app.route("/api/demo", demoRouter);
app.route("/v1/call", callRouter);

const port = Number(process.env.PORT || 3001);

// Initialize x402 facilitator, then start server
initializeFacilitator()
  .then(() => {
    serve({ fetch: app.fetch, port }, () => {
      console.log(`Stoa server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Fatal: Failed to start server:", err);
    process.exit(1);
  });

export { app };
export { generateEmbedding, generateServiceEmbedding } from "./lib/embeddings.js";

