import { Hono } from "hono";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

export const demoRouter = new Hono();

/**
 * Open demo endpoint — no auth required.
 * Encrypts a message with AES-256-GCM using a deterministic key derived from the service name.
 *
 * GET /api/demo/secret-message
 *   Returns a freshly-encrypted "hello from Stoa" payload.
 *
 * POST /api/demo/secret-message
 *   Body: { "message": "your text here" }
 *   Returns: { encrypted, iv, tag, decrypted (round-trip verification) }
 */

const SECRET_PASSPHRASE = "stoa-demo-2026-inceptrix-hackathon";

function deriveKey(passphrase: string): Buffer {
  return createHash("sha256").update(passphrase).digest(); // 32 bytes = AES-256
}

function encryptMessage(plaintext: string): { encrypted: string; iv: string; tag: string } {
  const key = deriveKey(SECRET_PASSPHRASE);
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

function decryptMessage(encryptedHex: string, ivHex: string, tagHex: string): string {
  const key = deriveKey(SECRET_PASSPHRASE);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

// GET — demo call that any agent/tool can hit to test the service
demoRouter.get("/secret-message", (c) => {
  const message = "Hello from Stoa 🔐 — this message is encrypted with AES-256-GCM";
  const { encrypted, iv, tag } = encryptMessage(message);

  return c.json({
    service: "Stoa Secret Message Encryptor",
    description: "A demo AI-callable service that encrypts & decrypts messages using AES-256-GCM",
    input: { message },
    output: {
      encrypted,
      iv,
      tag,
      algorithm: "AES-256-GCM",
    },
    hint: "POST to this endpoint with { \"message\": \"your text\" } to encrypt your own message",
    timestamp: new Date().toISOString(),
  });
});

// POST — encrypt a custom message (main callable endpoint)
demoRouter.post("/secret-message", async (c) => {
  let body: { message?: string } = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const message = body.message?.toString().trim();
  if (!message) {
    return c.json({ error: "Missing 'message' field in request body" }, 400);
  }
  if (message.length > 4096) {
    return c.json({ error: "Message too long (max 4096 chars)" }, 400);
  }

  const { encrypted, iv, tag } = encryptMessage(message);

  // Round-trip verify
  const decrypted = decryptMessage(encrypted, iv, tag);

  return c.json({
    service: "Stoa Secret Message Encryptor",
    input: { message },
    output: {
      encrypted,
      iv,
      tag,
      algorithm: "AES-256-GCM",
    },
    verification: {
      decrypted,
      roundTripOk: decrypted === message,
    },
    timestamp: new Date().toISOString(),
  });
});

// Health / schema introspection for Stoa marketplace
demoRouter.get("/schema", (c) => {
  return c.json({
    name: "Secret Message Encryptor",
    version: "1.0.0",
    description: "Encrypts any text message using AES-256-GCM. Returns the encrypted payload, IV, and auth tag.",
    endpoints: {
      "GET /api/demo/secret-message": "Returns a demo encrypted message",
      "POST /api/demo/secret-message": "Encrypts your message — body: { message: string }",
    },
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "The plaintext message to encrypt", maxLength: 4096 },
      },
      required: ["message"],
    },
    outputSchema: {
      type: "object",
      properties: {
        encrypted: { type: "string", description: "Hex-encoded ciphertext" },
        iv: { type: "string", description: "Hex-encoded initialization vector (96-bit)" },
        tag: { type: "string", description: "Hex-encoded GCM authentication tag (128-bit)" },
        algorithm: { type: "string", enum: ["AES-256-GCM"] },
      },
    },
    priceUsdcPerCall: 0.001,
    category: "security",
  });
});
