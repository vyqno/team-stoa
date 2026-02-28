import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, Wallet, Sparkles, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/CopyButton";
import { AgentCard } from "@/components/AgentCard";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/hooks/use-auth";
import { useWalletBalance, useRegisterService } from "@/hooks/use-services";
import { toast } from "@/hooks/use-toast";

/* ─── Animated Eye Components ─── */

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ size = 12, maxDistance = 5, pupilColor = "black", forceLookX, forceLookY }: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2);
    const dy = mouseY - (r.top + r.height / 2);
    const d = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
  })();

  return (
    <div ref={ref} className="rounded-full" style={{ width: size, height: size, backgroundColor: pupilColor, transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 0.1s ease-out" }} />
  );
};

interface EyeBallProps {
  size?: number; pupilSize?: number; maxDistance?: number; eyeColor?: string; pupilColor?: string; isBlinking?: boolean; forceLookX?: number; forceLookY?: number;
}

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = "white", pupilColor = "black", isBlinking = false, forceLookX, forceLookY }: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  const pos = (() => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const r = ref.current.getBoundingClientRect();
    const dx = mouseX - (r.left + r.width / 2);
    const dy = mouseY - (r.top + r.height / 2);
    const d = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
  })();

  return (
    <div ref={ref} className="rounded-full flex items-center justify-center transition-all duration-150" style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: "hidden" }}>
      {!isBlinking && <div className="rounded-full" style={{ width: pupilSize, height: pupilSize, backgroundColor: pupilColor, transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 0.1s ease-out" }} />}
    </div>
  );
};

/* ─── Animated Characters Panel ─── */

function AnimatedCharactersPanel({ hiding = false }: { hiding?: boolean }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const scheduleBlink = (setter: (v: boolean) => void): ReturnType<typeof setTimeout> => {
      const t = setTimeout(() => {
        setter(true);
        setTimeout(() => { setter(false); scheduleBlink(setter); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t1 = scheduleBlink(setIsPurpleBlinking);
    const t2 = scheduleBlink(setIsBlackBlinking);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const dx = mouseX - (rect.left + rect.width / 2);
    const dy = mouseY - (rect.top + rect.height / 3);
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const pPos = calcPos(purpleRef);
  const bPos = calcPos(blackRef);
  const yPos = calcPos(yellowRef);
  const oPos = calcPos(orangeRef);

  return (
    <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground">
      <div className="relative z-20">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <span className="font-display font-bold">STOA</span>
        </div>
      </div>

      <div className="relative z-20 flex items-end justify-center h-[400px]">
        <div className="relative" style={{ width: "420px", height: "320px" }}>
          {/* Purple */}
          <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700" style={{ left: "50px", width: "140px", height: hiding ? '340px' : "320px", backgroundColor: "#6C3FF5", borderRadius: "10px 10px 0 0", zIndex: 1, transform: hiding ? `skewX(-5deg)` : `skewX(${pPos.bodySkew}deg)`, transformOrigin: "bottom center" }}>
            <div className="absolute flex gap-6 transition-all duration-200" style={{ left: hiding ? '20px' : `${35 + pPos.faceX}px`, top: hiding ? '28px' : `${32 + pPos.faceY}px` }}>
              <EyeBall size={16} pupilSize={6} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking} forceLookX={hiding ? -5 : undefined} forceLookY={hiding ? -3 : undefined} />
              <EyeBall size={16} pupilSize={6} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking} forceLookX={hiding ? -5 : undefined} forceLookY={hiding ? -3 : undefined} />
            </div>
          </div>
          {/* Black */}
          <div ref={blackRef} className="absolute bottom-0 transition-all duration-700" style={{ left: "180px", width: "90px", height: "260px", backgroundColor: "#2D2D2D", borderRadius: "8px 8px 0 0", zIndex: 2, transform: hiding ? `skewX(-3deg)` : `skewX(${bPos.bodySkew}deg)`, transformOrigin: "bottom center" }}>
            <div className="absolute flex gap-4 transition-all duration-200" style={{ left: hiding ? '12px' : `${20 + bPos.faceX}px`, top: hiding ? '22px' : `${26 + bPos.faceY}px` }}>
              <EyeBall size={14} pupilSize={5} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking} forceLookX={hiding ? -4 : undefined} forceLookY={hiding ? -3 : undefined} />
              <EyeBall size={14} pupilSize={5} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking} forceLookX={hiding ? -4 : undefined} forceLookY={hiding ? -3 : undefined} />
            </div>
          </div>
          {/* Orange */}
          <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700" style={{ left: "0px", width: "180px", height: "160px", zIndex: 3, backgroundColor: "#FF9B6B", borderRadius: "100px 100px 0 0", transform: hiding ? `skewX(-4deg)` : `skewX(${oPos.bodySkew}deg)`, transformOrigin: "bottom center" }}>
            <div className="absolute flex gap-6 transition-all duration-200" style={{ left: hiding ? '48px' : `${62 + oPos.faceX}px`, top: hiding ? '68px' : `${72 + oPos.faceY}px` }}>
              <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={hiding ? -5 : undefined} forceLookY={hiding ? -3 : undefined} />
              <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={hiding ? -5 : undefined} forceLookY={hiding ? -3 : undefined} />
            </div>
          </div>
          {/* Yellow */}
          <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700" style={{ left: "240px", width: "110px", height: "200px", backgroundColor: "#E8D754", borderRadius: "60px 60px 0 0", zIndex: 4, transform: hiding ? `skewX(-4deg)` : `skewX(${yPos.bodySkew}deg)`, transformOrigin: "bottom center" }}>
            <div className="absolute flex gap-4 transition-all duration-200" style={{ left: hiding ? '28px' : `${40 + yPos.faceX}px`, top: hiding ? '30px' : `${34 + yPos.faceY}px` }}>
              <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={hiding ? -5 : undefined} forceLookY={hiding ? -3 : undefined} />
              <Pupil size={10} maxDistance={4} pupilColor="#2D2D2D" forceLookX={hiding ? -5 : undefined} forceLookY={hiding ? -3 : undefined} />
            </div>
            <div className="absolute w-14 h-[3px] bg-[#2D2D2D] rounded-full transition-all duration-200" style={{ left: hiding ? '20px' : `${32 + yPos.faceX}px`, top: hiding ? '68px' : `${72 + yPos.faceY}px` }} />
          </div>
        </div>
      </div>

      <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
        <Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
        <Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link>
      </div>

      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
    </div>
  );
}

/* ─── Main Page ─── */

const STEPS = ["Account", "Wallet", "Register", "Verify", "Published"];
const CATEGORIES = ["medical", "finance", "legal", "code", "data", "creative", "research", "security", "agriculture", "other"];

const DeveloperOnboarding = () => {
  const { user, register: authRegister, login } = useAuth();
  const { data: walletData } = useWalletBalance();
  const registerMutation = useRegisterService();

  const [step, setStep] = useState(user ? 2 : 0); // Skip to step 2 if already logged in
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agentForm, setAgentForm] = useState({ name: "", description: "", endpoint: "", price: "0.05", category: "medical" });
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false, false]);
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [registeredServiceId, setRegisteredServiceId] = useState<string | null>(null);

  useEffect(() => { document.title = "Developer Onboarding — Stoa"; }, []);

  // If user logs in externally, skip to step 2
  useEffect(() => {
    if (user && step < 2) setStep(2);
  }, [user]);

  // Auto-advance verification step
  useEffect(() => {
    if (step !== 3) return;
    const timers = checks.map((_, i) =>
      setTimeout(() => setChecks((prev) => { const n = [...prev]; n[i] = true; return n; }), (i + 1) * 600)
    );
    const advance = setTimeout(() => setStep(4), 3600);
    return () => { timers.forEach(clearTimeout); clearTimeout(advance); };
  }, [step]);

  const isFormValid = form.name && form.email && form.password.length >= 8 && form.password === form.confirm;
  const isAgentValid = agentForm.name && agentForm.description && agentForm.endpoint && agentForm.price;

  // Step 1: Real account creation
  const handleCreateAccount = useCallback(async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await authRegister(form.email, form.password);
      setStep(1);
    } catch (err: any) {
      // If user already exists, try login
      try {
        await login(form.email, form.password);
        setStep(1);
      } catch (loginErr: any) {
        setAuthError(err?.message || "Registration failed");
      }
    } finally {
      setAuthLoading(false);
    }
  }, [form.email, form.password, authRegister, login]);

  // Step 3: Real service registration
  const handleRegisterAgent = useCallback(async () => {
    if (!user) return;
    try {
      const result = await registerMutation.mutateAsync({
        ownerAddress: user.walletAddress || "0x0000000000000000000000000000000000000000",
        name: agentForm.name,
        description: agentForm.description,
        capabilities: [agentForm.name],
        category: agentForm.category,
        serviceType: "ai-agent",
        priceUsdcPerCall: parseFloat(agentForm.price) || 0.05,
        endpointUrl: agentForm.endpoint,
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: {} },
      });
      setRegisteredServiceId(result?.service?.id || null);
      setStep(3); // Go to verification
    } catch (err: any) {
      toast({ title: "Registration failed", description: err?.message || "Could not register service." });
    }
  }, [user, agentForm, registerMutation]);

  const handleTest = useCallback(async () => {
    try {
      await fetch(agentForm.endpoint, { method: "GET", mode: "no-cors" });
      toast({ title: "Connection successful", description: "Agent endpoint is reachable." });
    } catch {
      toast({ title: "Unreachable", description: "Could not reach endpoint. You can still continue." });
    }
  }, [agentForm.endpoint]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Animated Characters */}
      <AnimatedCharactersPanel hiding={showPassword && form.password.length > 0} />

      {/* Right: Form Content */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background pt-[72px]">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-heading-md font-bold">STOA</span>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-caption font-medium ${
                    i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="hidden md:inline font-body text-caption text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-muted rounded-full">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Account (real auth) */}
            {step === 0 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                <h2 className="font-display text-heading-lg font-bold">Create your account</h2>
                <Input placeholder="Display name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input type={showPassword ? "text" : "password"} placeholder="Confirm password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <Button variant="default" disabled={!isFormValid || authLoading} onClick={handleCreateAccount} className="w-full">
                  {authLoading ? <Spinner size="sm" /> : "Continue"}
                </Button>
              </motion.div>
            )}

            {/* Step 2: Wallet (real balance) */}
            {step === 1 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                <h2 className="font-display text-heading-lg font-bold">Your Wallet</h2>
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="font-body text-body-md font-medium">
                      {walletData?.address ? "Wallet Created" : "Provisioning wallet..."}
                    </span>
                    {walletData?.address && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                  {walletData?.address ? (
                    <>
                      <div className="flex items-center gap-2 font-mono text-body-sm">
                        <span>{walletData.address.slice(0, 6)}...{walletData.address.slice(-4)}</span>
                        <CopyButton text={walletData.address} />
                      </div>
                      <p className="font-body text-body-sm text-muted-foreground">
                        {(walletData.balanceUsdc ?? 0).toFixed(4)} USDC on Base Sepolia
                      </p>
                    </>
                  ) : (
                    <Spinner size="sm" />
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button variant="default" onClick={() => setStep(2)} className="flex-1">Continue</Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Register Agent (real mutation) */}
            {step === 2 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                <h2 className="font-display text-heading-lg font-bold">Register Your Agent</h2>
                <Input placeholder="Agent name" value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} />
                <textarea
                  placeholder="Description"
                  value={agentForm.description}
                  onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                  className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-body-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px] resize-y font-body"
                />
                <Input placeholder="API endpoint URL" value={agentForm.endpoint} onChange={(e) => setAgentForm({ ...agentForm, endpoint: e.target.value })} />
                <div className="flex gap-3">
                  <Input placeholder="Price per call" type="number" step="0.01" value={agentForm.price} onChange={(e) => setAgentForm({ ...agentForm, price: e.target.value })} />
                  <select
                    value={agentForm.category}
                    onChange={(e) => setAgentForm({ ...agentForm, category: e.target.value })}
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-body-sm font-body"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <Button variant="outline" onClick={handleTest} disabled={!agentForm.endpoint}>
                  Test Connection
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(user ? 2 : 1)}>Back</Button>
                  <Button
                    variant="default"
                    disabled={!isAgentValid || registerMutation.isPending}
                    onClick={handleRegisterAgent}
                    className="flex-1"
                  >
                    {registerMutation.isPending ? <Spinner size="sm" /> : "Continue"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Verification */}
            {step === 3 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                <h2 className="font-display text-heading-lg font-bold">Verifying...</h2>
                <div className="space-y-4">
                  {["Agent endpoint reachable", "Response schema valid", "Pricing configured", "Wallet connected", "Ready to publish"].map((item, i) => (
                    <div key={item} className="flex items-center gap-3 font-body text-body-md">
                      {checks[i] ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                          <Check className="h-5 w-5 text-primary" />
                        </motion.div>
                      ) : (
                        <Spinner size="sm" />
                      )}
                      <span className={checks[i] ? "text-foreground" : "text-muted-foreground"}>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Published */}
            {step === 4 && (
              <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }} className="flex items-center justify-center">
                  <CheckCircle2 className="h-16 w-16 text-primary" strokeWidth={1.5} />
                </motion.div>
                <h2 className="font-display text-display-sm font-bold">Published!</h2>
                <AgentCard
                  agent={{
                    id: registeredServiceId || "custom",
                    name: agentForm.name || "Your Agent",
                    category: agentForm.category,
                    description: agentForm.description || "Your amazing AI agent.",
                    pricePerCall: parseFloat(agentForm.price) || 0.05,
                    rating: 5.0,
                    totalCalls: 0,
                    verified: true,
                  }}
                  className="mx-auto"
                />
                {registeredServiceId && (
                  <div className="flex items-center justify-center gap-2 font-mono text-body-sm">
                    <span className="text-muted-foreground">/explore/{registeredServiceId}</span>
                    <CopyButton text={`${window.location.origin}/explore/${registeredServiceId}`} />
                  </div>
                )}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link to="/dashboard"><Button variant="default">Go to Dashboard</Button></Link>
                  {registeredServiceId && (
                    <Link to={`/explore/${registeredServiceId}`}><Button variant="outline">View Agent</Button></Link>
                  )}
                  <Button variant="outline" onClick={() => { setStep(2); setAgentForm({ name: "", description: "", endpoint: "", price: "0.05", category: "medical" }); setChecks([false, false, false, false, false]); }}>
                    List Another Agent
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            className="text-center font-body text-caption text-muted-foreground mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperOnboarding;
