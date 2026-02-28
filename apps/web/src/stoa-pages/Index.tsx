import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionTemplate, useAnimationFrame } from "framer-motion";
import { Search, CreditCard, Zap, CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/AgentCard";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { TextScramble } from "@/components/ui/text-scramble";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import { MagneticElement } from "@/components/animations/MagneticElement";
import { ParallaxLayer } from "@/components/animations/ParallaxLayer";
import { CountUp } from "@/components/animations/CountUp";
import { CodeTypewriter } from "@/components/animations/CodeTypewriter";
import { ScrollVelocityTicker } from "@/components/animations/ScrollVelocityTicker";
import { FloatingShape } from "@/components/animations/FloatingShape";
import HeroScrollAnimation from "@/components/ui/hero-scroll-animation";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { MOCK_TESTIMONIALS } from "@/lib/mock-data";
import { useActivity, useServices } from "@/hooks/use-services";
import { type AgentCardData } from "@/components/AgentCard";
import { useSEO } from "@/lib/seo";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function toAgentCard(service: any): AgentCardData {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    pricePerCall: Number(service.priceUsdcPerCall ?? 0),
    rating: Number(service.successRate ?? 100) / 20,
    totalCalls: service.totalCalls ?? 0,
    verified: Boolean(service.isVerified),
  };
}

/** Inline SVG grid pattern for hero background - light blue-green color */
const HeroGridPattern = ({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => (
  <svg className="w-full h-full" aria-hidden="true">
    <defs>
      <motion.pattern
        id="hero-grid-pattern"
        width={size}
        height={size}
        patternUnits="userSpaceOnUse"
        x={offsetX}
        y={offsetY}
      >
        <path
          d={`M ${size} 0 L 0 0 0 ${size}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-celery"
        />
      </motion.pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hero-grid-pattern)" />
  </svg>
);

function HeroGridBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);
  const gridSize = 44;
  const prefersReducedMotion = useReducedMotion();

  useAnimationFrame(() => {
    if (prefersReducedMotion) return;
    gridOffsetX.set((gridOffsetX.get() + 0.3) % gridSize);
    gridOffsetY.set((gridOffsetY.get() + 0.3) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(700px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div className="absolute inset-0 z-0" onMouseMove={handleMouseMove} aria-hidden="true">
      {/* Layer 1: Subtle always-visible grid */}
      <div className="absolute inset-0 opacity-[0.22]">
        <HeroGridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>
      {/* Layer 2: Mouse-reveal flashlight grid — brighter on hover */}
      <motion.div
        className="absolute inset-0 opacity-100"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <HeroGridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </motion.div>
    </div>
  );
}

const CODE_LINES = [
  { text: "import { Stoa } from '@stoa/sdk'", type: "keyword" as const },
  { text: "" },
  { text: "const agent = await Stoa.agent('chest-xray')", type: "default" as const },
  { text: "const result = await agent.call({ image: file })", type: "default" as const },
  { text: "console.log(result.diagnosis)", type: "string" as const },
];

const SCRAMBLE_TEXTS = [
  "Discover AI agents that just work.",
  "Pay per call. No subscriptions.",
  "From developers, for everyone.",
];

// Deep link demo states
const DEMO_STATES = ["ready", "connecting", "connected", "done"] as const;

function DeepLinkDemo() {
  const [state, setState] = useState<typeof DEMO_STATES[number]>("ready");

  const handleConnect = () => {
    if (state !== "ready") return;
    setState("connecting");
    setTimeout(() => setState("connected"), 2500);
    setTimeout(() => setState("done"), 5000);
    setTimeout(() => setState("ready"), 6500);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-lg max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {state === "ready" && (
          <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
            <Zap className="h-10 w-10 text-primary mx-auto" />
            <p className="font-body text-body-md font-medium">Add to Claude Desktop</p>
            <Button variant="default" onClick={handleConnect}>Connect Agent</Button>
          </motion.div>
        )}
        {state === "connecting" && (
          <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: "80%" }} transition={{ duration: 2 }} />
            </div>
            <p className="font-body text-body-sm text-muted-foreground">Connecting...</p>
          </motion.div>
        )}
        {state === "connected" && (
          <motion.div key="connected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
            </motion.div>
            <p className="font-body text-body-md font-medium">Agent added to Claude Desktop</p>
          </motion.div>
        )}
        {state === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
            <CheckCircle className="h-10 w-10 text-primary mx-auto" />
            <p className="font-body text-body-md font-semibold text-primary">You're all set!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CyclingScramble({ className }: { className?: string }) {
  const [textIndex, setTextIndex] = useState(0);
  const [scrambleKey, setScrambleKey] = useState(0);

  const handleComplete = () => {
    setTimeout(() => {
      setTextIndex((prev) => (prev + 1) % SCRAMBLE_TEXTS.length);
      setScrambleKey((prev) => prev + 1);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className={className}
    >
      <TextScramble
        key={scrambleKey}
        duration={1.2}
        speed={0.03}
        trigger={true}
        onScrambleComplete={handleComplete}
        className="font-body text-body-lg text-muted-foreground"
      >
        {SCRAMBLE_TEXTS[textIndex]}
      </TextScramble>
    </motion.div>
  );
}

function HorizontalScrollDiscover({ agents }: { agents: AgentCardData[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(agents.length - 1) * 25}%`]);

  return (
    <section ref={sectionRef} className="relative bg-card" style={{ height: `${Math.max(200, agents.length * 40)}vh` }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden px-6">
        <div className="mx-auto max-w-7xl w-full mb-8">
          <h2 className="font-display text-display-md font-bold text-card-foreground mb-2">
            <em className="italic font-serif">Discover.</em>
          </h2>
          <p className="font-body text-body-lg text-muted-foreground">
            Curated AI agents ready to integrate.
          </p>
        </div>

        <motion.div style={{ x }} className="flex gap-6 px-6">
          {agents.map((agent) => (
            <Link key={agent.id} to="/explore" className="flex-shrink-0">
              <AgentCard agent={agent} />
            </Link>
          ))}
        </motion.div>

        <div className="mx-auto max-w-7xl w-full mt-8">
          <div className="text-right">
            <Link
              to="/explore"
              className="font-body text-body-sm font-medium text-primary hover:underline underline-offset-4"
            >
              View All Agents →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  const { data: servicesData } = useServices({ limit: 8, sort: "popular" });
  const { data: activityData } = useActivity(30);

  const topAgents = useMemo(
    () => (servicesData?.services ?? []).slice(0, 6).map(toAgentCard),
    [servicesData?.services]
  );

  const serviceCount = servicesData?.count ?? 0;
  const activityCount = activityData?.count ?? 0;
  const activityList = activityData?.activity ?? [];
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useSEO({ title: "Stoa — AI Agent Marketplace", description: "Discover, use, and monetize AI agents. Pay per call with no subscriptions. Five lines of code or zero." });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark");

  return (
    <>
      <main>
        {/* ═══════════════ SECTION 1: HERO ═══════════════ */}
        {isDark ? (
          /* ── DARK MODE: Split layout with STOA center→left + 3D robot right ── */
          <section className="relative min-h-screen overflow-hidden bg-background px-6 pt-[72px]">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 z-[1]" />

            <div className="relative z-10 mx-auto max-w-7xl flex flex-col lg:flex-row items-center min-h-[calc(100vh-72px)]">
              {/* Left: Text content */}
              <motion.div
                className="flex-1 flex flex-col justify-center py-12 lg:py-0"
                initial={{ x: "25vw" }}
                animate={{ x: 0 }}
                transition={{ delay: 1.5, duration: 1.2, type: "spring", stiffness: 40, damping: 16 }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 }}
                  className="mb-6 inline-flex self-start items-center rounded-pill border border-primary/30 bg-primary/10 backdrop-blur-md px-5 py-2"
                >
                  <span className="font-body text-body-sm font-semibold text-primary">
                    The AI Agent Marketplace
                  </span>
                </motion.div>

                {/* STOA Heading */}
                <div className="mb-6 overflow-hidden">
                  {"STOA".split("").map((char, i) => (
                    <motion.span
                      key={i}
                      className="inline-block font-display text-hero font-bold text-foreground tracking-[0.15em]"
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.3 + i * 0.08,
                        type: "spring",
                        stiffness: 100,
                        damping: 12,
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>

                {/* Scrambling subtitle */}
                <CyclingScramble className="mb-10" />

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.9 }}
                  className="flex flex-wrap items-center gap-4 mb-12"
                >
                  <MagneticElement>
                    <Link to="/explore">
                      <Button variant="default" size="lg" className="bg-primary/60 backdrop-blur-xl border border-primary/30 shadow-lg">
                        Explore Agents
                      </Button>
                    </Link>
                  </MagneticElement>
                  <MagneticElement>
                    <Link to="/connect/developer">
                      <Button variant="outline" size="lg" className="backdrop-blur-md bg-background/30 border-border/50">
                        List Your Agent
                      </Button>
                    </Link>
                  </MagneticElement>
                </motion.div>

                {/* Stat Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.1 }}
                  className="inline-flex items-center gap-8 rounded-2xl border border-border/50 bg-card/30 px-8 py-5 backdrop-blur-xl self-start"
                >
                  {[
                    { end: serviceCount || 47, label: "Active Agents" },
                    { end: activityCount || 12400, label: "API Calls", suffix: "+" },
                    { end: 230, label: "Developers" },
                  ].map((stat, i) => (
                    <div key={stat.label} className="flex items-center gap-6">
                      {i > 0 && <div className="h-8 w-px bg-border" />}
                      <div className="text-center">
                        <CountUp
                          end={stat.end}
                          suffix={stat.suffix}
                          className="font-display text-display-sm font-bold text-foreground"
                        />
                        <p className="font-body text-body-sm text-muted-foreground mt-1">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right: 3D Spline Robot */}
              <motion.div
                className="flex-1 relative h-[500px] lg:h-[calc(100vh-72px)]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 1.2, ease: "easeOut" }}
              >
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              </motion.div>
            </div>
          </section>
        ) : (
          /* ── LIGHT MODE: Original centered layout (unchanged) ── */
          <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 pt-[72px]">
            {/* Infinite grid background with mouse hover flashlight */}
            <HeroGridBackground />

            {/* Floating shapes */}
            <ParallaxLayer speed={0.3} className="absolute top-20 right-[10%]">
              <FloatingShape size={300} className="opacity-[0.08]" />
            </ParallaxLayer>
            <ParallaxLayer speed={0.5} className="absolute bottom-20 left-[5%]">
              <FloatingShape size={200} className="opacity-[0.06]" />
            </ParallaxLayer>
            <ParallaxLayer speed={0.7} className="absolute top-1/2 right-[30%]">
              <FloatingShape size={150} className="opacity-[0.10]" />
            </ParallaxLayer>

            <div className="relative z-10 mx-auto max-w-5xl text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 inline-flex items-center rounded-pill border border-primary/30 bg-primary/10 backdrop-blur-md px-5 py-2"
              >
                <span className="font-body text-body-sm font-semibold text-primary">
                  The AI Agent Marketplace
                </span>
              </motion.div>

              {/* STOA Heading */}
              <div className="mb-6 overflow-hidden">
                {"STOA".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className="inline-block font-display text-hero font-bold text-foreground tracking-[0.15em]"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3 + i * 0.08,
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Scrambling subtitle */}
              <CyclingScramble className="mb-10" />

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap items-center justify-center gap-4 mb-12"
              >
                <MagneticElement>
                  <Link to="/explore">
                    <Button variant="default" size="lg" className="bg-primary/60 backdrop-blur-xl border border-primary/30 shadow-lg">
                      Explore Agents
                    </Button>
                  </Link>
                </MagneticElement>
                <MagneticElement>
                  <Link to="/connect/developer">
                    <Button variant="outline" size="lg">
                      List Your Agent
                    </Button>
                  </Link>
                </MagneticElement>
              </motion.div>

              {/* Stat Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="inline-flex items-center gap-8 rounded-2xl border border-border/50 bg-card/30 px-12 py-5 backdrop-blur-xl"
              >
                {[
                  { end: serviceCount || 47, label: "Active Agents" },
                  { end: activityCount || 12400, label: "API Calls", suffix: "+" },
                  { end: 230, label: "Developers" },
                ].map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-8">
                    {i > 0 && <div className="h-8 w-px bg-border" />}
                    <div className="text-center">
                      <CountUp
                        end={stat.end}
                        suffix={stat.suffix}
                        className="font-display text-display-sm font-bold text-foreground"
                      />
                      <p className="font-body text-body-sm text-muted-foreground mt-1">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══════════════ HERO SCROLL ANIMATION ═══════════════ */}
        <HeroScrollAnimation />

        {/* ═══════════════ VELOCITY TICKER ═══════════════ */}
        <section className="bg-ink py-4 overflow-hidden">
          <ScrollVelocityTicker
            texts={["AI AGENTS", "MARKETPLACE", "PAY PER CALL", "x402 PROTOCOL"]}
            className="font-body text-body-sm font-bold text-white tracking-[0.25em] uppercase"
          />
        </section>

        {/* ═══════════════ SECTION 2: DISCOVER (Horizontal Scroll) ═══════════════ */}
        <HorizontalScrollDiscover agents={topAgents} />

        {/* ═══════════════ SECTION 3: HOW IT WORKS ═══════════════ */}
        <section className="bg-cream py-20 md:py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <h2 className="font-display text-display-md font-bold text-foreground mb-16 text-center">
                How it <em className="italic font-serif">works.</em>
              </h2>
            </ScrollReveal>

            <div className="grid gap-12 md:grid-cols-3 relative">
              {/* Connecting lines on desktop */}
              <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              {[
                { step: "01", icon: Search, title: "Find", desc: "Browse curated AI agents by category, rating, or use case. Every agent is tested and verified." },
                { step: "02", icon: CreditCard, title: "Pay", desc: "Pay only for what you use. Micro-payments per API call via the x402 protocol." },
                { step: "03", icon: Zap, title: "Use", desc: "Integrate via SDK, REST API, or one-click MCP connection. Five lines of code or zero." },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative text-center md:text-left"
                  initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    delay: index * 0.2,
                    duration: 0.7,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                >
                  <span className="absolute -top-8 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 font-display text-[120px] font-bold text-primary/[0.14] leading-none select-none pointer-events-none">
                    {item.step}
                  </span>
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200, damping: 12 }}
                    >
                      <item.icon className="h-8 w-8 text-primary mb-4 mx-auto md:mx-0" />
                    </motion.div>
                    <h3 className="font-body text-heading-md font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="font-body text-body-md text-muted-foreground max-w-sm">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 4: FOR DEVELOPERS (DARK) ═══════════════ */}
        <section className="relative bg-ink py-20 md:py-32 px-6 overflow-hidden dotted-surface">
          <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-2 items-center">
            <div>
              <ScrollReveal>
                <h2 className="font-display text-display-sm md:text-display-md font-bold text-white mb-6">
                  Five lines of <em className="italic font-serif">code.</em>
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="font-body text-body-lg text-white/60 mb-8 max-w-md">
                  Our SDK makes integration effortless. Connect to any agent on the marketplace
                  with a simple, clean API. No boilerplate, no config files, no headaches.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <Link
                  to="/docs"
                  className="font-body text-body-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  Read the Docs →
                </Link>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.2} direction="right">
              <div className="rounded-xl bg-[#111111] border border-white/10 overflow-hidden">
                {/* Terminal chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-caption text-white/30">terminal</span>
                </div>
                <div className="p-6">
                  <CodeTypewriter lines={CODE_LINES} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════ SECTION 5: FOR EVERYONE ═══════════════ */}
        <section className="bg-card py-20 md:py-32 px-6">
          <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-2 items-center">
            <div>
              <ScrollReveal>
                <h2 className="font-display text-display-sm md:text-display-md font-bold text-card-foreground mb-6">
                  No code required.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="font-body text-body-lg text-muted-foreground mb-8 max-w-md">
                  Add AI agents to Claude Desktop, ChatGPT, or any MCP-compatible client
                  with a single click. No terminal, no API keys, no setup.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <Link to="/connect/user">
                  <Button variant="default" size="lg">
                    Connect Now →
                  </Button>
                </Link>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.2} direction="right">
              <DeepLinkDemo />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════ SECTION 6: LIVE ACTIVITY FEED ═══════════════ */}
        <section className="bg-ink py-12 md:py-16 px-6 overflow-hidden">
          <div className="mx-auto max-w-7xl mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
            <span className="font-body text-body-sm font-medium text-white/60">
              Live on Stoa
            </span>
          </div>

          <div className="group relative">
            <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused]">
              {[...activityList, ...activityList].map((tx, i) => (
                <div
                  key={`${tx.id}-${i}`}
                  className="flex-shrink-0 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3"
                >
                  <Zap className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-body text-body-sm font-medium text-white">
                      {tx.serviceName || tx.service_name || tx.serviceId || tx.service_id || "Agent"}
                    </p>
                    <p className="font-mono text-caption text-primary">
                      {Number(tx.costUsdc || tx.cost_usdc || 0).toFixed(2)} USDC
                    </p>
                  </div>
                  <span className="font-body text-caption text-white/30 ml-2">
                    {tx.timestamp || new Date(tx.createdAt || tx.created_at || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 7: TESTIMONIALS + CTA ═══════════════ */}
        <section className="bg-background py-20 md:py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal>
              <h2 className="font-display text-display-md font-bold text-foreground mb-4 text-center">
                Builders love <em className="italic font-serif">Stoa.</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="font-body text-body-lg text-muted-foreground mb-12 text-center">
                See what our community has to say.
              </p>
            </ScrollReveal>

            <div className="flex justify-center gap-6 max-h-[600px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
              <TestimonialsColumn
                testimonials={MOCK_TESTIMONIALS.slice(0, 2).map(t => ({ text: t.quote, image: t.image, name: t.name, role: `${t.role}, ${t.company}` }))}
                duration={15}
                className="hidden lg:block"
              />
              <TestimonialsColumn
                testimonials={MOCK_TESTIMONIALS.slice(2, 4).map(t => ({ text: t.quote, image: t.image, name: t.name, role: `${t.role}, ${t.company}` }))}
                duration={19}
              />
              <TestimonialsColumn
                testimonials={MOCK_TESTIMONIALS.slice(4, 6).map(t => ({ text: t.quote, image: t.image, name: t.name, role: `${t.role}, ${t.company}` }))}
                duration={17}
                className="hidden md:block"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-cream py-24 md:py-32 px-6">
          <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-2 items-start">
            {/* Left: Start Building */}
            <div>
              <ScrollReveal>
                <h2 className="font-display text-display-md md:text-display-lg font-bold text-foreground mb-6">
                  Start <em className="italic font-serif">building.</em>
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="font-body text-body-lg text-muted-foreground mb-10">
                  Join 230 developers already on Stoa.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="flex flex-wrap items-center gap-4">
                  <MagneticElement>
                    <Link to="/explore">
                      <Button variant="default" size="lg">
                        Explore Agents
                      </Button>
                    </Link>
                  </MagneticElement>
                  <MagneticElement>
                    <Link to="/connect/developer">
                      <Button variant="outline" size="lg">
                        List Your Agent
                      </Button>
                    </Link>
                  </MagneticElement>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Join Us */}
            <div>
              <ScrollReveal delay={0.2}>
                <h3 className="font-display text-heading-lg font-bold text-foreground mb-6">
                  Join us
                </h3>
                <p className="font-body text-body-md text-muted-foreground mb-8">
                  Follow us for updates, announcements, and community discussions.
                </p>
                <div className="flex flex-col gap-3">
                  <a href="https://x.com/StoaSystem" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 ease-out hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-foreground transition-colors duration-300 group-hover:text-primary" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    <span className="font-body text-body-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">X (Twitter)</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto size-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/stoa-systems-9ba9b83b3" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 ease-out hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-foreground transition-colors duration-300 group-hover:text-primary" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    <span className="font-body text-body-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">LinkedIn</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto size-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                  </a>
                  <a href="https://www.reddit.com/user/AcanthisittaThen4628/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 ease-out hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-foreground transition-colors duration-300 group-hover:text-primary" aria-hidden="true"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
                    <span className="font-body text-body-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">Reddit</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto size-4 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;

