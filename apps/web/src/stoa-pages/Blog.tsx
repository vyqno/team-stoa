import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Button } from "@/components/ui/button";

const POSTS = [
  {
    slug: "introducing-x402",
    title: "Introducing x402: Micropayments for AI",
    date: "Feb 20, 2026",
    tag: "Product",
    excerpt: "A new payment protocol that makes per-call billing seamless for AI agents.",
    readTime: "5 min read",
    body: `The AI industry has a billing problem. Most platforms force developers into subscription tiers that don't match real usage patterns. You pay for capacity you don't use, or hit walls when you need to scale.

x402 changes this. Built on Base, it enables HTTP-native micropayments — meaning every API call can carry its own payment. No subscriptions, no prepaid credits, no invoicing delays.

**How it works:**
When you call a Stoa agent, the x402 protocol handles payment at the HTTP layer. Your wallet is debited the exact cost of that call — typically fractions of a cent — and the developer receives funds instantly.

**Why it matters for developers:**
- Set your own per-call price (as low as $0.001)
- Receive payments in real-time, not net-30
- No minimum payout thresholds
- 95% revenue share (5% platform fee)

**Why it matters for users:**
- Pay only for what you use
- No commitment or lock-in
- Transparent pricing on every agent
- Free tier to get started (10 calls)

We believe micropayments unlock a fundamentally better model for AI commerce. Instead of betting on a subscription, you can try dozens of agents for pennies and only scale what works.

x402 is live on Base Sepolia today. Mainnet support is coming Q2 2025.`,
  },
  {
    slug: "why-we-built-stoa",
    title: "Why We Built Stoa",
    date: "Feb 10, 2026",
    tag: "Company",
    excerpt: "The story behind the AI agent marketplace and where we're heading next.",
    readTime: "4 min read",
    body: `Every week, thousands of developers train and fine-tune AI models. Most of those models never reach a user. They sit in notebooks, buried in research repos, or locked behind enterprise contracts that take months to negotiate.

We built Stoa to change that.

**The problem:** There's no easy way for an independent developer to monetize an AI model. And there's no easy way for a non-technical user to access one.

**Our solution:** An open marketplace where any developer can list an AI agent with a price, and any user can call it — either through code (SDK/API) or through one-click MCP integration with tools like Claude Desktop.

**What makes Stoa different:**
- **Pay-per-call:** No subscriptions. You pay exactly what you use via x402 micropayments.
- **Zero-config for users:** Add agents to Claude or ChatGPT with one click. No terminal required.
- **Five lines of code for devs:** Our SDK makes integration trivial.
- **On-chain transparency:** Every transaction is verifiable on Base.

We're still early — 47 agents live, 230 developers onboarded, running on testnet. But the foundation is solid, and we're shipping fast.

If you're building AI and want to reach users without building a SaaS company around it, Stoa is for you.`,
  },
  {
    slug: "building-your-first-agent",
    title: "Building Your First Agent in 5 Minutes",
    date: "Jan 28, 2026",
    tag: "Tutorial",
    excerpt: "A step-by-step guide to deploying and monetizing your AI model on Stoa.",
    readTime: "6 min read",
    body: `This tutorial walks you through listing your first AI agent on Stoa. By the end, you'll have a live, monetized agent on the marketplace.

**Prerequisites:**
- A working API endpoint that accepts POST requests
- A Stoa account (sign up at /connect/developer)

**Step 1: Create your account**
Head to the Developer Onboarding flow and fill in your details. A wallet will be created for you automatically on Base Sepolia.

**Step 2: Register your agent**
Provide your agent's name, description, API endpoint URL, and set your per-call price. Categories include Medical AI, NLP, Vision, Security, and more.

**Step 3: Test the connection**
Click "Test Connection" to verify your endpoint is reachable. We'll send a health-check request and validate the response schema.

**Step 4: Automated verification**
Stoa runs five automated checks: endpoint reachability, response schema validation, pricing configuration, wallet connection, and publish readiness. This takes about 15 seconds.

**Step 5: You're live!**
Your agent appears on the Explore page immediately. Users can find it, try it, and pay per call. You'll see earnings in your Dashboard in real-time.

**Tips for success:**
- Write a clear, specific description — users search by keywords
- Keep response times under 2 seconds for the best ratings
- Start with a competitive price and adjust based on demand
- Respond to user feedback in your Dashboard`,
  },
  {
    slug: "state-of-ai-agent-marketplaces-2026",
    title: "The State of AI Agent Marketplaces in 2026",
    date: "Jan 15, 2026",
    tag: "Research",
    excerpt: "Our analysis of the growing ecosystem of AI agent platforms and what sets Stoa apart.",
    readTime: "7 min read",
    body: `The AI agent marketplace category barely existed a year ago. Today, it's one of the fastest-growing segments in the AI ecosystem. Here's our analysis of where things stand and where they're heading.

**The landscape:**
Several platforms have emerged to help developers distribute AI models. Most follow one of two patterns: (1) centralized SaaS platforms with subscription billing, or (2) open-source registries with no monetization layer.

Stoa takes a third path: an open marketplace with built-in micropayments. This means developers can monetize without building billing infrastructure, and users can try agents without committing to subscriptions.

**Key trends we're seeing:**
- **MCP adoption is accelerating.** The Model Context Protocol is becoming the standard for connecting AI agents to chat interfaces. Stoa's one-click MCP integration is our fastest-growing feature.
- **Per-call pricing is winning.** Users prefer paying for what they use. Our data shows 3x higher trial rates compared to subscription-based alternatives.
- **Specialization beats generalization.** The most successful agents on Stoa solve one specific problem extremely well. Medical diagnostics, code review, and sentiment analysis are our top categories.
- **Non-technical users are the growth driver.** 60% of Stoa's MCP connections come from users who have never written code.

**What's next:**
We're working on agent composition (chaining multiple agents together), streaming responses, and mainnet launch on Base. The goal is to make Stoa the default place to discover, use, and monetize AI agents.

The future of AI isn't one model to rule them all — it's a marketplace of specialized agents, each earning its keep one call at a time.`,
  },
];

function BlogList() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="font-display text-display-md font-bold text-foreground mb-4">Blog</h1>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="font-body text-body-lg text-muted-foreground mb-12">
            Updates, tutorials, and thoughts from the Stoa team.
          </p>
        </ScrollReveal>

        <div className="space-y-8">
          {POSTS.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.1}>
              <Link to={`/blog/${post.slug}`}>
                <article className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="rounded-pill bg-primary/10 px-3 py-1 font-body text-caption font-medium text-primary">
                      {post.tag}
                    </span>
                    <span className="font-body text-caption text-muted-foreground">{post.date}</span>
                    <span className="flex items-center gap-1 font-body text-caption text-muted-foreground ml-auto">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>
                  <h2 className="font-display text-heading-md font-bold text-foreground mb-2">{post.title}</h2>
                  <p className="font-body text-body-md text-muted-foreground">{post.excerpt}</p>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = POSTS.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!post) {
    return (
      <section className="py-20 px-6 text-center">
        <p className="font-body text-body-lg text-muted-foreground mb-6">Post not found.</p>
        <Button variant="outline" onClick={() => navigate("/blog")}>Back to Blog</Button>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32 px-6">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/blog")}
          className="inline-flex items-center gap-2 font-body text-body-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="rounded-pill bg-primary/10 px-3 py-1 font-body text-caption font-medium text-primary">
            {post.tag}
          </span>
          <span className="font-body text-caption text-muted-foreground">{post.date}</span>
          <span className="flex items-center gap-1 font-body text-caption text-muted-foreground">
            <Clock className="h-3 w-3" /> {post.readTime}
          </span>
        </div>

        <h1 className="font-display text-display-sm md:text-display-md font-bold text-foreground mb-8">
          {post.title}
        </h1>

        <div className="prose prose-sm max-w-none space-y-4">
          {post.body.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return <h3 key={i} className="font-body text-heading-sm font-semibold text-foreground mt-8 mb-2">{paragraph.replace(/\*\*/g, "")}</h3>;
            }
            if (paragraph.startsWith("**")) {
              return <h3 key={i} className="font-body text-heading-sm font-semibold text-foreground mt-8 mb-2">{paragraph.replace(/\*\*/g, "")}</h3>;
            }
            if (paragraph.startsWith("- ")) {
              return (
                <ul key={i} className="space-y-2 ml-4">
                  {paragraph.split("\n").map((line, j) => (
                    <li key={j} className="font-body text-body-md text-muted-foreground">{line.replace(/^- \*\*(.+?)\*\*/, "$1 —").replace(/^- /, "")}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i} className="font-body text-body-md text-muted-foreground leading-relaxed">{paragraph}</p>;
          })}
        </div>
      </div>
    </section>
  );
}

const Blog = () => {
  useEffect(() => {
    document.title = "Blog — Stoa";
  }, []);

  return (
    <main className="bg-background pt-[72px]">
      <BlogList />
    </main>
  );
};

export { BlogPost };
export default Blog;
