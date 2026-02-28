import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Brain, Wrench, Database, Radio, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useRegisterService } from "@/hooks/use-services";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";

const SERVICE_TYPES = [
  { value: "ml-model", label: "AI/ML Model", icon: Brain, desc: "Machine learning model inference" },
  { value: "ai-agent", label: "AI Agent", icon: Radio, desc: "Autonomous AI agent service" },
  { value: "api-tool", label: "Tool / API", icon: Wrench, desc: "REST API or tool endpoint" },
  { value: "data-feed", label: "Data Feed", icon: Database, desc: "Structured data provider" },
];

const CATEGORIES = ["medical", "finance", "legal", "code", "data", "creative", "research", "security", "agriculture", "other"];

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function RegisterServicePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const account = useActiveAccount();
  const registerMutation = useRegisterService();

  // Accept either backend user OR connected wallet as authentication
  const isAuthenticated = !!user || !!account?.address;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    serviceType: "ml-model",
    endpointUrl: "",
    name: "",
    description: "",
    category: "other",
    capabilities: "",
    priceUsdcPerCall: 0.01,
  });
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [endpointOk, setEndpointOk] = useState<boolean | null>(null);

  function update(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Validate whether the user can proceed to the next step
  function canProceed(): boolean {
    switch (step) {
      case 0: return !!form.serviceType;
      case 1: return isValidUrl(form.endpointUrl);
      case 2: return form.name.trim().length >= 3 && form.description.trim().length >= 10;
      case 3: return form.priceUsdcPerCall >= 0.001 && form.priceUsdcPerCall <= 1;
      default: return true;
    }
  }

  async function testEndpoint() {
    if (!isValidUrl(form.endpointUrl)) {
      toast.error("Please enter a valid URL (https://...)");
      return;
    }
    setTestingEndpoint(true);
    setEndpointOk(null);
    try {
      await fetch(form.endpointUrl, { method: "GET", mode: "no-cors" });
      setEndpointOk(true);
      toast.success("Endpoint reachable!");
    } catch {
      setEndpointOk(false);
      toast.error("Could not reach endpoint. Continuing anyway...");
    } finally {
      setTestingEndpoint(false);
    }
  }

  async function handleSubmit() {
    const ownerAddress = user?.walletAddress || account?.address || "0x0000000000000000000000000000000000000000";
    if (!isAuthenticated) {
      toast.error("Please connect your wallet first");
      navigate("/connect");
      return;
    }

    if (!form.name.trim() || !form.description.trim() || !isValidUrl(form.endpointUrl)) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    try {
      const caps = form.capabilities.split(",").map((c) => c.trim()).filter(Boolean);

      await registerMutation.mutateAsync({
        ownerAddress,
        name: form.name.trim(),
        description: form.description.trim(),
        capabilities: caps.length ? caps : [form.name.trim()],
        category: form.category,
        serviceType: form.serviceType,
        priceUsdcPerCall: form.priceUsdcPerCall,
        endpointUrl: form.endpointUrl.trim(),
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: {} },
      });

      toast.success("Service registered!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  if (loading && !account) {
    return <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 pt-[92px] text-center text-muted-foreground">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 pt-[92px] text-center space-y-6">
        <LogIn className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign in to list a service</h1>
        <p className="text-muted-foreground">You need an account to register services on Stoa.</p>
        <Link to="/connect">
          <Button size="lg">Sign In / Register</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    <div key="type" className="space-y-4">
      <h2 className="text-xl font-semibold">What are you offering?</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {SERVICE_TYPES.map((t) => (
          <Card key={t.value} className={`cursor-pointer transition-all ${form.serviceType === t.value ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"}`} onClick={() => update("serviceType", t.value)}>
            <CardContent className="pt-4 flex items-start gap-3"><t.icon className="h-5 w-5 text-primary mt-0.5" /><div><p className="font-medium">{t.label}</p><p className="text-sm text-muted-foreground">{t.desc}</p></div></CardContent>
          </Card>
        ))}
      </div>
    </div>,

    <div key="endpoint" className="space-y-4">
      <h2 className="text-xl font-semibold">Where is it?</h2>
      <div className="space-y-2">
        <Input placeholder="https://your-service.example.com/api/predict" value={form.endpointUrl} onChange={(e) => update("endpointUrl", e.target.value)} />
        <div className="rounded-lg bg-muted/60 border border-border p-3 text-sm space-y-1">
          <p className="font-medium text-foreground">🔐 Try the built-in demo endpoint:</p>
          <code className="text-xs font-mono text-primary break-all">http://localhost:3001/api/demo/secret-message</code>
          <p className="text-xs text-muted-foreground">A live AES-256-GCM encryption service — POST a message, get back encrypted ciphertext. No auth needed.</p>
          <Button variant="outline" size="sm" className="mt-1 h-7 text-xs" onClick={() => { update("endpointUrl", "http://localhost:3001/api/demo/secret-message"); setEndpointOk(null); }}>
            Use demo endpoint
          </Button>
        </div>
      </div>
      {form.endpointUrl && !isValidUrl(form.endpointUrl) && (
        <p className="text-sm text-destructive">Please enter a valid URL starting with https:// or http://</p>
      )}
      <div className="flex items-center gap-3"><Button variant="outline" onClick={testEndpoint} disabled={!isValidUrl(form.endpointUrl) || testingEndpoint}>{testingEndpoint ? "Testing..." : "Test Endpoint"}</Button>{endpointOk === true && <Badge variant="default" className="gap-1"><Check className="h-3 w-3" /> Reachable</Badge>}{endpointOk === false && <Badge variant="secondary">Unreachable (you can still continue)</Badge>}</div>
    </div>,

    <div key="describe" className="space-y-4">
      <h2 className="text-xl font-semibold">Describe it</h2>
      <div className="space-y-3">
        <div><label className="text-sm font-medium">Name</label><Input placeholder="Chest X-Ray Analyzer" value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
        <div><label className="text-sm font-medium">Description</label><Textarea placeholder="Analyzes chest X-ray images to detect abnormalities..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} /></div>
        <div><label className="text-sm font-medium">Category</label><Select value={form.category} onValueChange={(v) => update("category", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
        <div><label className="text-sm font-medium">Capabilities (comma-separated)</label><Input placeholder="image analysis, medical imaging, diagnosis" value={form.capabilities} onChange={(e) => update("capabilities", e.target.value)} /></div>
      </div>
    </div>,

    <div key="price" className="space-y-4">
      <h2 className="text-xl font-semibold">Set your price</h2>
      <Input type="number" step="0.001" min="0.001" max="1" value={form.priceUsdcPerCall} onChange={(e) => update("priceUsdcPerCall", parseFloat(e.target.value) || 0.01)} />
      <input type="range" min="0.001" max="1" step="0.001" value={form.priceUsdcPerCall} onChange={(e) => update("priceUsdcPerCall", parseFloat(e.target.value))} className="w-full" />
      <div className="flex justify-between text-xs text-muted-foreground"><span>$0.001</span><span className="font-mono font-bold text-foreground text-base">${form.priceUsdcPerCall.toFixed(3)} / call</span><span>$1.000</span></div>
    </div>,

    <div key="review" className="space-y-4">
      <h2 className="text-xl font-semibold">Review & Publish</h2>
      <Card><CardContent className="pt-4 space-y-3"><div className="grid grid-cols-2 gap-2 text-sm"><span className="text-muted-foreground">Name</span><span className="font-medium">{form.name || "-"}</span><span className="text-muted-foreground">Type</span><span className="capitalize">{form.serviceType}</span><span className="text-muted-foreground">Category</span><span className="capitalize">{form.category}</span><span className="text-muted-foreground">Price</span><span className="font-mono">${form.priceUsdcPerCall.toFixed(4)} / call</span></div><p className="text-sm text-muted-foreground">{form.description}</p></CardContent></Card>
      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={registerMutation.isPending || !form.name || !form.endpointUrl}>{registerMutation.isPending ? "Publishing..." : "Publish to Marketplace"}</Button>
    </div>,
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 pt-[92px]">
      <Button variant="ghost" size="sm" className="mb-6 gap-2" onClick={() => navigate("/dashboard")}><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Button>
      <h1 className="text-3xl font-bold mb-2">Register a New Service</h1>
      <p className="text-muted-foreground mb-8">List your AI service on Stoa in minutes</p>

      <div className="flex gap-2 mb-8">{["Type", "Endpoint", "Details", "Price", "Review"].map((label, i) => (<div key={i} className="flex-1"><div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} /><p className={`text-xs mt-1 ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</p></div>))}</div>
      <div className="mb-8">{steps[step]}</div>

      {step < 4 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>Next <ArrowRight className="h-4 w-4 ml-2" /></Button>
        </div>
      )}
    </div>
  );
}