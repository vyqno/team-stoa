<p align="center">
  <img src="https://img.shields.io/badge/STOA-AI%20Marketplace-000?style=for-the-badge&labelColor=0a0a0a&color=a3e035" alt="Stoa" height="36" />
</p>

<h1 align="center">Stoa</h1>

<p align="center">
  <strong>A decentralized AI services marketplace with on-chain USDC payments</strong>
</p>

<p align="center">
  <a href="https://stoa-api-production-58bd.up.railway.app/health"><img src="https://img.shields.io/badge/API-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white" alt="Railway" /></a>
  <a href="https://hiteshx33-chest-xray-service.hf.space"><img src="https://img.shields.io/badge/ML-HuggingFace-FFD21E?style=flat-square&logo=huggingface&logoColor=black" alt="HuggingFace" /></a>
  <img src="https://img.shields.io/badge/Chain-Base%20Sepolia-0052FF?style=flat-square&logo=coinbase&logoColor=white" alt="Base Sepolia" />
  <img src="https://img.shields.io/badge/Protocol-x402-8B5CF6?style=flat-square" alt="x402" />
  <img src="https://img.shields.io/badge/MCP-Claude%20Desktop-D97706?style=flat-square" alt="MCP" />
</p>

<br />

> **Discover, call, and pay for AI/ML services — directly from Claude Desktop, Cursor, or any MCP client.**
> Providers register endpoints. Consumers pay per-call in USDC. Payments settle on-chain via the x402 protocol.

---

<details>
<summary><kbd>&nbsp;Table of Contents&nbsp;</kbd></summary>

&nbsp;

- [What is Stoa](#what-is-stoa)
- [Architecture](#architecture)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Live Deployments](#-live-deployments)
- [How It Works](#how-it-works)
  - [Service Discovery](#-service-discovery)
  - [Payment Flow (x402)](#-payment-flow-x402)
  - [Authentication](#-authentication)
  - [MCP Integration](#-mcp-integration)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Team](#team)

&nbsp;

</details>

---

## What is Stoa

Stoa is a **full-stack AI services marketplace** where:

- **Providers** register ML models, AI agents, or API tools — set a price in USDC, and earn per call
- **Consumers** discover services via semantic search, call them, and pay automatically on-chain
- **AI assistants** (Claude, Cursor) interact with the marketplace natively through MCP tools — search, call, and pay without leaving the conversation

The entire payment layer runs on **Base Sepolia** using the **x402 HTTP payment protocol** — no smart contract deployment needed. Services are discoverable via **pgvector semantic search** powered by HuggingFace embeddings.

---

## Architecture

```
                         C O N S U M E R S
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │   Web App    │    │    Claude    │    │   Agent SDK  │
    │  (Next.js)   │    │   Desktop   │    │  (TypeScript)│
    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
           │                   │                    │
           │            ┌──────┴───────┐            │
           │            │  MCP Server  │            │
           │            │  (16+ tools) │            │
           │            └──────┬───────┘            │
           │                   │                    │
           ▼                   ▼                    ▼
    ╔══════════════════════════════════════════════════════╗
    ║              S T O A   A P I   (Hono)               ║
    ║                                                      ║
    ║  ┌────────┐  ┌──────────┐  ┌────────┐  ┌────────┐  ║
    ║  │  Auth  │  │ Services │  │ Wallet │  │  x402  │  ║
    ║  │ Routes │  │  Routes  │  │ Routes │  │  Proxy │  ║
    ║  └────┬───┘  └────┬─────┘  └────┬───┘  └────┬───┘  ║
    ║       └────────────┴─────────────┴───────────┘      ║
    ║            Drizzle ORM  +  pgvector                  ║
    ╚═══════════════════════╤══════════════════════════════╝
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Supabase │  │ Coinbase │  │    HF    │
        │ Postgres │  │   CDP    │  │  Spaces  │
        └──────────┘  └──────────┘  └──────────┘
```

---

## Monorepo Structure

```
stoa/
│
├── apps/
│   ├── web/                   Next.js 16 frontend
│   │                          thirdweb wallet, Radix UI, Framer Motion
│   │
│   └── mcp-server/            MCP server for Claude Desktop & Cursor
│                              16+ tools: search, call, pay, manage
│
├── packages/
│   ├── server/                Hono API backend
│   │                          auth, services, wallet, x402, razorpay
│   │
│   ├── db/                    Drizzle ORM + pgvector
│   │                          schema, queries, semantic search
│   │
│   ├── shared/                Zod schemas, TypeScript types, constants
│   │
│   ├── agent-sdk/             TypeScript SDK for the Stoa API
│   │
│   └── contracts/             Smart contract stubs
│
├── services/
│   ├── chest-xray-service/    Pneumonia detection (ViT, HF Spaces)
│   ├── plant-disease-service/ Plant disease ID (MobileNetV2, HF Spaces)
│   └── digital-twin-agent/    AI personality service (FastAPI)
│
├── scripts/
│   └── seed-services.ts       Seed marketplace with starter data
│
├── Dockerfile                 Multi-stage build for Railway
├── turbo.json                 Turborepo pipeline
└── pnpm-workspace.yaml        Workspace definition
```

**Package dependency graph:**

```
shared ──────┐
             ├──► server ──► Docker ──► Railway
db ──────────┘
                    │
mcp-server ◄────────┤  (calls API over HTTP)
web ◄───────────────┤  (calls API over HTTP)
agent-sdk ◄─────────┘  (calls API over HTTP)
```

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | Next.js 16 &middot; React 19 &middot; TailwindCSS 4 &middot; Radix UI &middot; Framer Motion &middot; Recharts |
| **Backend** | Hono 4 &middot; Node.js 24 &middot; TypeScript 5.7 |
| **Database** | PostgreSQL (Supabase) &middot; Drizzle ORM &middot; pgvector |
| **Blockchain** | Base Sepolia &middot; USDC &middot; Viem 2 &middot; Coinbase CDP SDK |
| **Payments** | x402 Protocol v2 &middot; @x402/hono &middot; @x402/fetch &middot; @x402/evm |
| **Wallet** | thirdweb 5 (frontend) &middot; Coinbase CDP (backend managed) |
| **Embeddings** | HuggingFace Inference &middot; nomic-embed-text-v1.5 (768-dim) |
| **AI Models** | HuggingFace Spaces &middot; FastAPI + Docker |
| **MCP** | @modelcontextprotocol/sdk &middot; stdio + SSE transport |
| **Auth** | JWT &middot; bcrypt &middot; API keys &middot; Google OAuth (Supabase) |
| **Fiat Onramp** | Razorpay (INR to USDC) |
| **Monorepo** | pnpm 9 &middot; Turborepo 2 |
| **Deployment** | Railway (API) &middot; Vercel (Web) &middot; HuggingFace Spaces (ML) |

---

## Live Deployments

| Service | URL | Status |
|:--------|:----|:-------|
| **API Backend** | `https://stoa-api-production-58bd.up.railway.app` | Railway |
| **Health Check** | `https://stoa-api-production-58bd.up.railway.app/health` | `GET` |
| **Chest X-ray Model** | `https://hiteshx33-chest-xray-service.hf.space` | HF Spaces |
| **Plant Disease Model** | `https://hiteshx33-plant-disease-service.hf.space` | HF Spaces |
| **Database** | Supabase PostgreSQL + pgvector | Supabase |
| **Blockchain** | Base Sepolia &middot; Chain ID `84532` | Testnet |
| **USDC Contract** | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Base Sepolia |

---

## How It Works

### Service Discovery

Services are registered with metadata, capabilities, and pricing. Each service gets a **768-dimensional embedding** (via `nomic-embed-text-v1.5`) stored in a pgvector column. Discovery uses **cosine similarity search**:

```
User query: "detect pneumonia from medical images"
                    │
                    ▼
         ┌─────────────────────┐
         │  Generate embedding  │  HuggingFace Inference API
         │  (768 dimensions)    │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  pgvector cosine    │  PostgreSQL + Drizzle
         │  similarity search   │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Ranked results     │  Sorted by match score
         │  with confidence    │
         └─────────────────────┘
```

### Payment Flow (x402)

```
Consumer                     Stoa API                     Provider
   │                            │                            │
   │  POST /v1/call/:id         │                            │
   │  ──────────────────────►   │                            │
   │                            │                            │
   │  402 + PAYMENT-REQUIRED    │                            │
   │  ◄──────────────────────   │                            │
   │                            │                            │
   │  Same request +            │                            │
   │  PAYMENT-SIGNATURE header  │                            │
   │  ──────────────────────►   │                            │
   │                            │  Forward to endpoint       │
   │                            │  ──────────────────────►   │
   │                            │                            │
   │                            │  Result                    │
   │                            │  ◄──────────────────────   │
   │                            │                            │
   │  Result + txHash +         │  Settle on-chain (async)   │
   │  basescanUrl               │                            │
   │  ◄──────────────────────   │                            │
```

**Three payment modes:**

| Mode | When | How |
|:-----|:-----|:----|
| **x402 (on-chain)** | MCP/SDK with wallet key | USDC signed via Viem, settled on Base Sepolia |
| **API Key auth** | `X-Stoa-Key` header | Cost tracked in DB, deducted from balance |
| **Free / Test** | `priceUsdcPerCall = 0` or `?test=true` | Direct call, no payment |

### Authentication

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Email /    │      │   Google    │      │   Wallet    │
│  Password   │      │   OAuth     │      │  (thirdweb) │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                     │
       ▼                    ▼                     ▼
╔═════════════════════════════════════════════════════════╗
║                    Stoa Auth Layer                       ║
║                                                         ║
║  JWT Token  ◄───  User Record  ───►  API Key            ║
║  (session)       (PostgreSQL)        (X-Stoa-Key)       ║
╚═════════════════════════════════════════════════════════╝
```

- **JWT Bearer tokens** — web sessions (`POST /api/auth/login`)
- **API keys** — SDK, MCP, and programmatic access (`X-Stoa-Key` header)
- **Wallet linking** — connect your own wallet or auto-provision a CDP managed wallet

### MCP Integration

The MCP server exposes **16+ tools** that Claude Desktop or Cursor can call natively:

| Category | Tools |
|:---------|:------|
| **Account** | `create_account` &middot; `login` |
| **Discovery** | `find_service` &middot; `list_services` &middot; `get_service_schema` &middot; `get_activity` &middot; `get_provider` |
| **ML Inference** | `analyze_xray` &middot; `analyze_plant` |
| **Service Calls** | `call_service` (with automatic x402 payment) |
| **Wallet** | `get_wallet_status` &middot; `fund_wallet` &middot; `withdraw` &middot; `get_usage` |
| **Provider** | `register_service` &middot; `my_services` &middot; `update_service` &middot; `deactivate_service` |

**Claude Desktop config:**

```json
{
  "mcpServers": {
    "stoa": {
      "command": "npx",
      "args": ["@stoa/mcp-server"],
      "env": {
        "STOA_API_KEY": "stoa_your_key_here",
        "WALLET_PRIVATE_KEY": "0x..."
      }
    }
  }
}
```

---

## Database Schema

```
┌──────────────────────┐         ┌──────────────────────────┐
│       users           │         │        services           │
├──────────────────────┤         ├──────────────────────────┤
│ id          uuid PK   │◄────────│ userId        uuid FK    │
│ email       unique     │         │ id            uuid PK    │
│ passwordHash           │         │ ownerAddress             │
│ walletAddress          │         │ name                     │
│ cdpWalletId            │         │ description              │
│ displayName            │         │ capabilities    jsonb    │
│ googleId               │         │ category                 │
│ createdAt              │         │ serviceType              │
└──────────┬────────────┘         │ priceUsdcPerCall numeric │
           │                      │ endpointUrl              │
           │                      │ embedding     vector(768)│
           │                      │ totalCalls               │
           │                      │ successRate              │
           │                      │ isActive                 │
           │                      │ isVerified               │
           │                      └──────────┬───────────────┘
           │                                 │
  ┌────────┴─────────────┐         ┌─────────┴──────────────┐
  │      api_keys         │         │       call_logs         │
  ├──────────────────────┤         ├────────────────────────┤
  │ id          uuid PK   │         │ id          uuid PK    │
  │ userId      uuid FK   │         │ serviceId   uuid FK    │
  │ keyHash     sha256    │         │ userId      uuid FK    │
  │ keyPrefix             │         │ callerAddress          │
  │ label                 │         │ costUsdc               │
  │ revokedAt             │         │ txHash                 │
  └──────────────────────┘         │ latencyMs              │
                                   │ success                │
  ┌──────────────────────┐         └────────────────────────┘
  │  topup_transactions   │
  ├──────────────────────┤
  │ id          uuid PK   │
  │ userId      uuid FK   │
  │ amountInr             │
  │ amountUsdc            │
  │ razorpayOrderId       │
  │ status                │
  └──────────────────────┘
```

**Key indexes:** `category`, `ownerAddress`, `isActive`, `serviceType`, `embedding` (pgvector)

---

## API Reference

<details>
<summary><kbd>&nbsp;Authentication&nbsp;</kbd></summary>

&nbsp;

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/register` | Create account (email + password) — returns API key |
| `POST` | `/api/auth/login` | Login — returns JWT token |
| `POST` | `/api/auth/google` | Google OAuth via Supabase access token |
| `GET` | `/api/auth/me` | Current user profile (JWT or API key) |

&nbsp;

</details>

<details>
<summary><kbd>&nbsp;Services&nbsp;</kbd></summary>

&nbsp;

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/services` | Register a new service |
| `POST` | `/api/services/search` | Semantic search (pgvector embeddings) |
| `GET` | `/api/services` | List services (filters: category, type, sort, limit, offset) |
| `GET` | `/api/services/:id` | Service details + recent call logs |
| `PUT` | `/api/services/:id` | Update service (owner auth required) |
| `DELETE` | `/api/services/:id` | Deactivate service (owner auth required) |
| `POST` | `/api/services/:id/verify` | Verify endpoint is reachable |
| `POST` | `/api/services/:id/embedding` | Regenerate embedding vector |

&nbsp;

</details>

<details>
<summary><kbd>&nbsp;Service Calls (x402)&nbsp;</kbd></summary>

&nbsp;

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/v1/call/:serviceId` | Call a service — x402 payment or API key auth |

Returns: `{ result, cost, txHash, basescanUrl, latencyMs }`

&nbsp;

</details>

<details>
<summary><kbd>&nbsp;Wallet&nbsp;</kbd></summary>

&nbsp;

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/wallet/link` | Link external wallet address |
| `GET` | `/api/wallet/balance` | Current USDC balance (on-chain) |
| `GET` | `/api/wallet/address` | Get or auto-create wallet address |
| `GET` | `/api/wallet/transactions` | Call history with costs |
| `GET` | `/api/wallet/usage` | Aggregate usage stats |
| `POST` | `/api/wallet/topup/razorpay` | Create Razorpay order (INR to USDC) |
| `POST` | `/api/wallet/topup/razorpay/verify` | Verify Razorpay payment |
| `GET` | `/api/wallet/topup/history` | Top-up transaction history |

&nbsp;

</details>

<details>
<summary><kbd>&nbsp;Providers & Activity&nbsp;</kbd></summary>

&nbsp;

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/providers/:userId` | Provider profile + stats |
| `GET` | `/api/providers/:userId/services` | Provider's registered services |
| `GET` | `/api/activity` | Recent marketplace activity feed |

&nbsp;

</details>

---

## Getting Started

### Prerequisites

| Requirement | Version |
|:------------|:--------|
| Node.js | >= 20 |
| pnpm | >= 9 |
| PostgreSQL | with pgvector extension |

```bash
# Enable pnpm via corepack
corepack enable && corepack prepare pnpm@latest --activate
```

### Install & Run

```bash
# 1 — Clone the repo
git clone <repo-url> && cd stoa

# 2 — Install all dependencies
pnpm install

# 3 — Configure environment
cp .env.example .env
# Fill in all required values (see next section)

# 4 — Push database schema
pnpm --filter @stoa/db drizzle-kit push

# 5 — Seed the marketplace
pnpm seed

# 6 — Start everything
pnpm dev
```

| Service | Default URL |
|:--------|:------------|
| API | `http://localhost:3001` |
| Web | `http://localhost:3000` |

### Run Individual Packages

```bash
# API server only
pnpm --filter @stoa/server dev

# Web frontend only
pnpm --filter @stoa/web dev

# MCP server (stdio mode)
cd apps/mcp-server && node dist/index.js
```

---

## Environment Variables

### `packages/server` — API Backend

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `DATABASE_URL` | Yes | PostgreSQL connection (transaction pooler, port 6543) |
| `DATABASE_URL_DIRECT` | Migrations | Direct connection (port 5432) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `HF_TOKEN` | Yes | HuggingFace API token |
| `HF_EMBEDDING_MODEL` | — | Default: `nomic-ai/nomic-embed-text-v1.5` |
| `EMBEDDING_DIMENSIONS` | — | Default: `768` |
| `CDP_API_KEY_ID` | Yes | Coinbase CDP API key ID |
| `CDP_API_KEY_SECRET` | Yes | Coinbase CDP API key secret |
| `CDP_WALLET_SECRET` | — | CDP wallet encryption secret |
| `X402_FACILITATOR_URL` | — | Default: Coinbase facilitator |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Google OAuth | Supabase service role key |
| `PORT` | — | Default: `3001` |

### `apps/web` — Frontend

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `NEXT_PUBLIC_API_URL` | Yes | Stoa API URL |
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | Yes | thirdweb project client ID |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay public key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |

### `apps/mcp-server` — MCP Tools

| Variable | Required | Description |
|:---------|:--------:|:------------|
| `STOA_API_URL` | — | Default: production Railway URL |
| `STOA_API_KEY` | Yes | User's API key for authenticated calls |
| `WALLET_PRIVATE_KEY` | For x402 | Private key for on-chain payment signing |

---

## Deployment

### API Backend &rarr; Railway

The multi-stage Dockerfile builds `shared` &rarr; `db` &rarr; `server`:

```dockerfile
FROM node:24-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY packages/db/ packages/db/
COPY packages/server/ packages/server/
RUN pnpm install --frozen-lockfile && pnpm run build
EXPOSE 3001
CMD ["node", "packages/server/dist/index.js"]
```

Set all server env vars in Railway dashboard. Port: `3001`.

### Frontend &rarr; Vercel

```bash
cd apps/web && vercel deploy
```

Set `NEXT_PUBLIC_*` variables in Vercel project settings.

### ML Models &rarr; HuggingFace Spaces

Each service in `services/` is a standalone FastAPI app deployed as a Docker Space:

| Service | Space |
|:--------|:------|
| Chest X-ray detection | `hiteshx33-chest-xray-service` |
| Plant disease detection | `hiteshx33-plant-disease-service` |
| Digital twin agent | HF Spaces (Docker SDK) |

---

## Team

Built by **Team Stoa** for the **Inceptrix Hackathon**.

---

<p align="center">
  <sub>Base Sepolia &middot; x402 Protocol &middot; Coinbase CDP &middot; HuggingFace &middot; thirdweb</sub>
</p>
