import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";
import { cn } from "@/lib/utils";

/* ─────────────── FAQ data (separate so we render it as an accordion) ─────────────── */
const FAQ_ITEMS = [
  { q: "What blockchain does Stoa use?", a: "Stoa runs on Base Sepolia (testnet). Mainnet launch is planned for Q2 2025." },
  { q: "Do I need crypto knowledge to use Stoa?", a: "No! Non-technical users can connect agents via one-click MCP integration without any crypto setup." },
  { q: "How do I get testnet USDC?", a: "Visit the Base Sepolia faucet to get free testnet tokens. You can also request tokens from the Stoa Discord." },
  { q: "Can I list my own AI agent?", a: "Yes! Go to Connect → Developer to register your agent. You'll need an API endpoint and a brief description." },
  { q: "What's the x402 protocol?", a: "x402 enables HTTP-native micropayments, allowing pay-per-call API pricing without traditional payment infrastructure. It works at the protocol level so there's zero integration overhead." },
  { q: "Is there a free tier?", a: "Yes, new users get 10 free API calls to try any agent. No credit card or wallet required." },
  { q: "How fast are agent responses?", a: "Most agents respond in under 2 seconds. Response times vary by agent complexity and input size." },
  { q: "Can I use Stoa agents in production?", a: "Currently Stoa is on testnet. Production readiness is coming soon — join the waitlist for mainnet access." },
  { q: "What happens if an agent call fails?", a: "Failed calls are not charged. You'll receive a structured error response with a code and message. Retry logic is built into the SDK." },
  { q: "How do I monitor my usage?", a: "The Dashboard shows real-time usage stats, call history, latency charts, and spend breakdowns per agent." },
];

/* ─────────────── FAQ Accordion component ─────────────── */
function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={cn(
              "rounded-xl border transition-all duration-200",
              isOpen ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-card hover:border-primary/20"
            )}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className={cn(
                "font-body text-body-md font-semibold transition-colors",
                isOpen ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.q}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180 text-primary"
              )} />
            </button>
            <div className={cn(
              "overflow-hidden transition-all duration-200 ease-out",
              isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
            )}>
              <p className="px-5 pb-5 font-body text-body-sm text-muted-foreground leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────── Docs content sections ─────────────── */
const DOCS_SECTIONS = [
  {
    title: "Getting Started",
    slug: "getting-started",
    content: `# Getting Started with Stoa

Welcome to Stoa — the AI agent marketplace built on Base, powered by x402.

## Installation

\`\`\`bash
npm install @stoa/sdk
\`\`\`

## Quick Start

\`\`\`typescript
import { Stoa } from '@stoa/sdk'

// Initialize the client
const stoa = new Stoa({ apiKey: 'sk-your-key' })

// Call an agent
const result = await stoa.agent('chest-xray').call({
  image: fileBuffer
})

console.log(result.diagnosis)
\`\`\`

That's it — five lines of code to call any AI agent on the marketplace.

## Environment Variables

We recommend storing your API key in an environment variable:

\`\`\`bash
STOA_API_KEY=sk-your-key
\`\`\`

Then initialize without hard-coding:

\`\`\`typescript
const stoa = new Stoa({ apiKey: process.env.STOA_API_KEY })
\`\`\``,
  },
  {
    title: "SDK Reference",
    slug: "sdk",
    content: `# SDK Reference

## \`Stoa(config)\`

Initialize the Stoa client.

| Parameter | Type | Description |
|-----------|------|-------------|
| apiKey | string | Your API key from the dashboard |
| baseUrl | string | Optional. Override the API endpoint |
| timeout | number | Optional. Request timeout in ms (default 30000) |

## \`stoa.agent(id)\`

Get an agent instance by ID. Returns an Agent object with \`.call()\` and \`.stream()\` methods.

## \`agent.call(input)\`

Execute an agent with the given input. Returns a promise with the result.

\`\`\`typescript
const agent = stoa.agent('sentiment-analyzer')
const result = await agent.call({ text: 'I love this product!' })
// { sentiment: 'positive', confidence: 0.98 }
\`\`\`

## \`agent.stream(input)\`

Stream results from an agent in real-time. Useful for long-running tasks or chat-style responses.

\`\`\`typescript
const stream = await stoa.agent('code-reviewer').stream({
  code: sourceCode,
  language: 'typescript'
})

for await (const chunk of stream) {
  process.stdout.write(chunk.text)
}
\`\`\`

## \`stoa.list(options)\`

List available agents with optional filters.

\`\`\`typescript
const agents = await stoa.list({
  category: 'medical',
  sortBy: 'rating',
  limit: 10
})
\`\`\`

## Error Handling

All SDK methods throw typed errors:

\`\`\`typescript
import { StoaError } from '@stoa/sdk'

try {
  await agent.call(input)
} catch (err) {
  if (err instanceof StoaError) {
    console.log(err.code)    // 'RATE_LIMIT' | 'AUTH' | 'AGENT_ERROR'
    console.log(err.message) // Human-readable message
  }
}
\`\`\``,
  },
  {
    title: "MCP Setup",
    slug: "mcp",
    content: `# MCP Setup

Connect Stoa agents to Claude Desktop, ChatGPT, or any MCP-compatible client.

## One-Click Setup

1. Go to [Connect](/connect/user)
2. Select your agents
3. Click "Add to Claude Desktop"
4. Done! Your agents are now available in Claude.

## Manual Configuration

Add this to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "stoa": {
      "command": "npx",
      "args": ["@stoa/mcp-server"],
      "env": {
        "STOA_API_KEY": "sk-your-key"
      }
    }
  }
}
\`\`\`

## ChatGPT Plugin

For ChatGPT integration, install the Stoa plugin from the ChatGPT plugin store and authenticate with your API key.

## Supported Clients

- Claude Desktop (full MCP support)
- ChatGPT (via plugin)
- Cursor (via MCP)
- Windsurf (via MCP)
- Any MCP-compatible client`,
  },
  {
    title: "API Reference",
    slug: "api",
    content: `# API Reference

Base URL: \`https://api.stoa.ai/v1\`

## Authentication

Include your API key in the Authorization header:

\`\`\`
Authorization: Bearer sk-your-api-key
\`\`\`

## Endpoints

### List Agents
\`GET /agents\`

Returns a paginated list of all available agents.

### Get Agent
\`GET /agents/:id\`

Returns detailed information about a specific agent including pricing, schema, and usage stats.

### Call Agent
\`POST /agents/:id/call\`

Execute an agent. The request body must match the agent's input schema.

### Get Call Result
\`GET /calls/:callId\`

Retrieve the result of a previous call by its ID. Useful for async operations.

### Usage Stats
\`GET /usage\`

Returns your API usage statistics for the current billing period.

## Response Format

All responses follow a standard envelope:

\`\`\`json
{
  "ok": true,
  "data": { ... },
  "meta": { "latency_ms": 1240, "cost_usdc": "0.05" }
}
\`\`\`

## Rate Limits

- Free tier: 10 calls total
- Starter: 100 requests per minute
- Pro: 1000 requests per minute
- Enterprise: Custom limits

Rate limit headers are included in every response:

\`\`\`
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1700000000
\`\`\``,
  },
  {
    title: "Webhooks",
    slug: "webhooks",
    content: `# Webhooks

Receive real-time notifications when events happen on your account.

## Setting Up Webhooks

Configure webhooks in your Dashboard under Settings → Webhooks.

1. Add your endpoint URL
2. Select the events you want to listen for
3. Copy the signing secret

## Supported Events

- \`agent.call.completed\` — An agent call finished successfully
- \`agent.call.failed\` — An agent call encountered an error
- \`wallet.funded\` — Your wallet received funds
- \`wallet.low_balance\` — Your balance dropped below threshold
- \`agent.published\` — Your agent went live on the marketplace

## Verifying Signatures

Every webhook includes a signature header for verification:

\`\`\`typescript
import { verifyWebhook } from '@stoa/sdk'

app.post('/webhooks/stoa', (req, res) => {
  const isValid = verifyWebhook(
    req.body,
    req.headers['x-stoa-signature'],
    process.env.WEBHOOK_SECRET
  )

  if (!isValid) return res.status(401).send('Invalid signature')

  const event = req.body
  console.log(event.type) // 'agent.call.completed'
  res.status(200).send('OK')
})
\`\`\`

## Retry Policy

Failed deliveries are retried up to 5 times with exponential backoff (1s, 5s, 30s, 2min, 10min).`,
  },
  {
    title: "Payments",
    slug: "payments",
    content: `# Payments

Stoa uses the **x402 protocol** for micropayments on Base Sepolia.

## How it works

1. You fund your wallet with USDC on Base
2. Each API call deducts the agent's per-call price
3. Developers receive funds directly in their wallet
4. No subscriptions, no minimums, no lock-in

## Pricing Model

- Per-call pricing set by the agent developer
- Volume discounts available (10% off at 100+ calls, 20% at 1000+)
- Free tier: First 10 calls are free for new users

## Wallet Management

Fund and manage your wallet from the Dashboard:

- View balance and transaction history
- Set up auto-fund rules
- Configure low-balance alerts
- Export transaction receipts

## For Agent Developers

As a developer, you receive payments directly:

- Set your own per-call price (minimum $0.001 USDC)
- View earnings in real-time on the Developer Dashboard
- Withdraw to any Base-compatible wallet
- 5% platform fee on all transactions`,
  },
  {
    title: "Security",
    slug: "security",
    content: `# Security & Authentication

## API Key Management

- Generate keys from the Dashboard → API Keys page
- Each key has configurable permissions (read-only, full access)
- Rotate keys regularly — old keys can be revoked instantly
- Never commit keys to version control

## Best Practices

- Store API keys in environment variables, not in code
- Use separate keys for development and production
- Set IP allowlists for production keys
- Enable webhook signature verification
- Monitor the Usage page for unusual activity

## Data Privacy

- Agent inputs are processed and discarded — we do not store your data
- All API traffic is encrypted via TLS 1.3
- SOC 2 Type II compliance is in progress
- GDPR-compliant data handling

## Rate Limiting & Abuse Prevention

Rate limits protect both users and agents:

- Per-key rate limits are enforced server-side
- Burst protection prevents accidental overuse
- Automatic throttling with clear error responses
- Contact support for custom limits on Enterprise plans`,
  },
  {
    title: "Agent Lifecycle",
    slug: "agent-lifecycle",
    content: `# Agent Lifecycle

How agents go from idea to live on the marketplace.

## Publishing an Agent

1. Register as a developer at [Connect → Developer](/connect/developer)
2. Provide your agent's API endpoint URL
3. Define input/output schemas
4. Set pricing and metadata
5. Submit for review

## Review Process

All agents undergo a review before going live:

- Automated testing of endpoint availability
- Schema validation (inputs/outputs match declared types)
- Response time benchmarking (must respond within 30s)
- Content policy check

Review typically takes 24-48 hours.

## Versioning

- Agents support semantic versioning (1.0.0, 1.1.0, etc.)
- Users are pinned to the major version by default
- Breaking changes require a new major version
- Deprecation notices are sent 30 days before removal

## Monitoring Your Agent

The Developer Dashboard shows:

- Total calls and revenue
- Average latency and error rate
- User ratings and feedback
- Geographic distribution of calls`,
  },
  {
    title: "Changelog",
    slug: "changelog",
    content: `# Changelog

## v0.5.0 — February 27, 2026 (11:30 AM – Present)

### Site-Wide Improvements
- Added ScrollToTop component — every route change now scrolls the page to the top smoothly
- Fixed all dead links across the site (Login Sign Up → /connect/user, Forgot Password → /contact, Footer developer links → /docs)
- Updated copyright year from 2025 to 2026 in Footer
- Integrated animated social icons (GitHub, X, LinkedIn, Dribbble) in Footer

### Homepage (Index)
- Added infinite-scrolling celery-colored SVG grid background with mouse flashlight hover effect
- Increased hero grid glow intensity: hover opacity 0.60 → 0.90, flashlight radius 450px → 550px, stroke width 1.2 → 1.5, base grid opacity 0.10 → 0.14

### Documentation (Docs)
- Complete rewrite: all content sections now render inside styled card containers grouped by ## headings
- Added interactive FAQ accordion with expand/collapse for 10 questions
- Added 4 new sections: Webhooks, Security & Authentication, Agent Lifecycle, Changelog
- Sidebar click now scrolls to top of content area
- Added Stoa-themed capabilities accordion on Getting Started page

### Explore
- Fixed category filter, price range filter, and sort functionality (Newest, Most Popular, Cheapest)
- Search now also matches agent descriptions

### Dashboard
- Wallet page: added functional Add Funds / Withdraw panels with amount input and validation
- Added transaction history list with recent deposits and agent calls

### Blog
- Complete rewrite with 4 full-length articles and slug-based detail pages (/blog/:slug)
- Added read time, article body content, and back navigation

### About
- Removed team section entirely
- Added values grid (Speed, Open, Trust, Builders First) and platform stats

### Contact
- Added per-field form validation (name, email format, message min 10 chars)
- Added animated success state with CheckCircle2 icon and spring animation

### Careers
- Apply buttons now open mailto with pre-filled subject and body template

### Onboarding
- Replaced 🎉 emoji with CheckCircle2 icon + spring animation on both User and Developer onboarding completion screens

### ConnectHub (Choose Your Path)
- Reverted to clean simple card design with 3D tilt hover effect
- Added "Already have an account? Log in" link

### Login
- Integrated animated-characters-login-page component with eye-tracking characters
- Fixed Sign Up link and Forgot Password link

## v0.4.0 — June 2025

- Added agent streaming support (\`agent.stream()\`)
- Webhook delivery with signature verification
- Dashboard usage charts with date range filters
- SDK error types for better error handling

## v0.3.0 — May 2025

- One-click MCP integration for Claude Desktop
- ChatGPT plugin support
- Volume discount tiers (10% at 100+, 20% at 1000+)
- Agent versioning and deprecation notices

## v0.2.0 — April 2025

- Developer onboarding flow
- Wallet management and transaction history
- Agent review process and automated testing
- Rate limiting with clear error responses

## v0.1.0 — March 2025

- Initial testnet launch on Base Sepolia
- SDK release (\`@stoa/sdk\`)
- Core marketplace with 20 launch agents
- Basic dashboard with API key management`,
  },
  {
    title: "FAQ",
    slug: "faq",
    content: `__FAQ__`,
  },
];

/* ─────────────── Docs page ─────────────── */
const Docs = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = "Documentation — Stoa"; }, []);

  const handleSectionChange = (slug: string) => {
    setActiveSection(slug);
    // scroll to top of content area
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    // also scroll the window so the top of the content is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const section = DOCS_SECTIONS.find((s) => s.slug === activeSection) || DOCS_SECTIONS[0];

  const isFaq = section.slug === "faq";

  return (
    <main className="min-h-screen bg-background pt-[72px]">
      <div className="flex mx-auto max-w-6xl w-full justify-center">
        {/* Sidebar */}
        <aside className="hidden md:block w-[260px] border-r border-border p-6 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <h3 className="font-body text-caption font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Documentation
          </h3>
          <nav className="space-y-1">
            {DOCS_SECTIONS.map((s) => (
              <button
                key={s.slug}
                onClick={() => handleSectionChange(s.slug)}
                className={cn(
                  "w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 font-body text-body-sm transition-colors",
                  activeSection === s.slug
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform", activeSection === s.slug && "rotate-90")} />
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div ref={contentRef} className="flex-1 px-6 md:px-12 py-12 max-w-3xl">
          {/* Mobile section selector */}
          <select
            value={activeSection}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="md:hidden w-full mb-8 rounded-xl border border-input bg-background px-3 py-2 font-body text-body-sm"
          >
            {DOCS_SECTIONS.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>

          {/* FAQ gets special rendering */}
          {isFaq ? (
            <div>
              <h1 className="font-display text-display-sm font-bold text-foreground mb-8">Frequently Asked Questions</h1>
              <FaqAccordion />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {(() => {
                const lines = section.content.split("\n");
                const elements: React.ReactNode[] = [];
                let currentCard: React.ReactNode[] = [];
                let cardHeading = "";
                let cardIndex = 0;
                let inCodeBlock = false;
                let codeLines: string[] = [];
                let codeLang = "";

                const renderLine = (line: string, i: number) => {
                  if (line.startsWith("### ")) return <h3 key={i} className="font-body text-heading-md font-semibold text-foreground mt-6 mb-3">{line.slice(4)}</h3>;
                  if (line.startsWith("| ") || line.startsWith("|--")) return null;
                  if (line.startsWith("- ")) return <li key={i} className="font-body text-body-md text-muted-foreground ml-4">{line.slice(2)}</li>;
                  if (line.match(/^\d+\.\s/)) return <li key={i} className="font-body text-body-md text-muted-foreground ml-4 list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
                  if (line.trim() === "") return <div key={i} className="h-2" />;
                  return <p key={i} className="font-body text-body-md text-muted-foreground leading-relaxed">{line}</p>;
                };

                const flushCard = () => {
                  if (currentCard.length > 0) {
                    elements.push(
                      <div key={`card-${cardIndex}`} className="rounded-xl border border-border bg-card p-6 mb-6">
                        <h2 className="font-display text-heading-lg font-bold text-foreground mb-4">{cardHeading}</h2>
                        {currentCard}
                      </div>
                    );
                    cardIndex++;
                    currentCard = [];
                  }
                };

                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];

                  if (line.startsWith("```")) {
                    if (!inCodeBlock) {
                      inCodeBlock = true;
                      codeLang = line.slice(3).trim();
                      codeLines = [];
                    } else {
                      inCodeBlock = false;
                      currentCard.push(
                        <pre key={`code-${i}`} className="rounded-lg bg-muted/50 border border-border p-4 my-3 overflow-x-auto">
                          <code className="font-mono text-caption text-foreground">{codeLines.join("\n")}</code>
                        </pre>
                      );
                    }
                    continue;
                  }

                  if (inCodeBlock) { codeLines.push(line); continue; }

                  if (line.startsWith("# ")) {
                    flushCard();
                    elements.push(
                      <h1 key={`h1-${i}`} className="font-display text-display-sm font-bold text-foreground mb-6">{line.slice(2)}</h1>
                    );
                    continue;
                  }

                  if (line.startsWith("## ")) {
                    flushCard();
                    cardHeading = line.slice(3);
                    continue;
                  }

                  if (!cardHeading && currentCard.length === 0 && elements.length > 0) {
                    elements.push(renderLine(line, i));
                    continue;
                  }

                  if (!cardHeading) {
                    elements.push(renderLine(line, i));
                    continue;
                  }

                  currentCard.push(renderLine(line, i));
                }

                flushCard();
                return elements;
              })()}
            </div>
          )}

          {/* Capabilities showcase — Getting Started only */}
          {activeSection === "getting-started" && (
            <div className="mt-16 border-t border-border pt-12">
              <LandingAccordionItem />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Docs;
