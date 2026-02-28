import { useMemo, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, CheckCircle, Upload, ArrowLeft, Play } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentCard, type AgentCardData } from "@/components/AgentCard";
import { CopyButton } from "@/components/CopyButton";
import { Spinner } from "@/components/Spinner";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { useService, useServices } from "@/hooks/use-services";

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

const AgentDetail = () => {
  const { id } = useParams();
  const serviceId = id ?? "";

  const { data, isLoading } = useService(serviceId);
  const { data: listData } = useServices({ limit: 10 });

  const [tryLoading, setTryLoading] = useState(false);
  const [tryResult, setTryResult] = useState<object | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const service = data?.service;
  const similar = useMemo(() => {
    const all = listData?.services ?? [];
    return all.filter((s: any) => s.id !== serviceId).slice(0, 4).map(toAgentCard);
  }, [listData?.services, serviceId]);

  const mcpCommand = service ? `npx @stoa/mcp-server --service ${service.id}` : "npx @stoa/mcp-server";

  // Build chart data from recentCalls
  const chartData = useMemo(() => {
    const calls = data?.recentCalls ?? [];
    if (calls.length === 0) return [];

    // Group calls by date
    const grouped: Record<string, number> = {};
    calls.forEach((call: any) => {
      const date = new Date(call.createdAt || call.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([day, count]) => ({ day, calls: count }));
  }, [data?.recentCalls]);

  const handleTry = useCallback(async () => {
    if (!service) return;
    setTryLoading(true);
    setTryResult(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);

      const res = await fetch(`${apiUrl}/v1/call/${service.id}?test=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const json = await res.json();
      setTryResult(json);
    } catch (err: any) {
      setTryResult({ error: err?.message || "Failed to run test" });
    } finally {
      setTryLoading(false);
    }
  }, [service]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // File upload is visual enhancement — triggers the same handleTry call
    handleTry();
  }, [handleTry]);

  if (isLoading) {
    return <main className="min-h-screen bg-background pt-[72px] px-6 py-12"><Spinner /></main>;
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-background pt-[72px] px-6 py-12">
        <p className="text-muted-foreground">Service not found.</p>
        <Link to="/explore"><Button variant="outline" className="mt-4">Back to Explore</Button></Link>
      </main>
    );
  }

  const price = Number(service.priceUsdcPerCall || 0);

  return (
    <main className="min-h-screen bg-background pt-[72px]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link to="/explore" className="inline-flex items-center gap-2 font-body text-body-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero */}
            <ScrollReveal>
              <div className="flex items-start gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-display text-display-sm font-bold text-foreground">
                      {service.name}
                    </h1>
                    {service.isVerified && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-body-sm">
                    <span className="rounded-pill bg-primary/10 px-3 py-1 text-caption font-medium uppercase tracking-wider text-primary">
                      {service.category}
                    </span>
                    <span className="font-mono text-foreground">${price.toFixed(4)}/call</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {(Number(service.successRate || 100) / 20).toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">{(service.totalCalls || 0).toLocaleString()} calls</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="api">API Schema</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <p className="font-body text-body-md text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                {!!service.capabilities?.length && (
                  <div>
                    <h3 className="font-body text-heading-sm font-semibold text-foreground mb-3">Capabilities</h3>
                    <ul className="space-y-2">
                      {service.capabilities.map((cap: string) => (
                        <li key={cap} className="flex items-center gap-2 font-body text-body-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="api">
                <div className="rounded-xl bg-ink p-6 font-mono text-body-sm text-white/80 relative">
                  <CopyButton text={JSON.stringify(service.inputSchema || {}, null, 2)} className="absolute top-4 right-4 text-white/40" />
                  <p className="text-primary mb-4">POST /v1/call/{service.id}</p>
                  <pre className="text-white/60 whitespace-pre-wrap">{JSON.stringify(service.inputSchema || {}, null, 2)}</pre>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="rounded-2xl border border-border p-6">
                  <h3 className="font-body text-heading-sm font-semibold mb-4">Pricing</h3>
                  <div className="space-y-3 font-body text-body-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Per call</span><span className="font-mono">${price.toFixed(4)} USDC</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">100+ calls</span><span className="font-mono">${(price * 0.9).toFixed(4)} USDC</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">1,000+ calls</span><span className="font-mono">${(price * 0.8).toFixed(4)} USDC</span></div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="rounded-2xl border border-border p-6 space-y-6">
                  {/* Usage Chart */}
                  {chartData.length > 0 && (
                    <div>
                      <h3 className="font-body text-heading-sm font-semibold mb-4">Usage</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(70 47% 54%)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(70 47% 54%)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" hide />
                          <YAxis hide />
                          <Tooltip />
                          <Area type="monotone" dataKey="calls" stroke="hsl(70 47% 54%)" fill="url(#colorCalls)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recent Calls List */}
                  <div>
                    <h3 className="font-body text-heading-sm font-semibold mb-3">Recent calls</h3>
                    {(data?.recentCalls ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent calls yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {data.recentCalls.slice(0, 10).map((call: any) => (
                          <div key={call.id} className="flex items-center justify-between text-sm">
                            <span>{new Date(call.createdAt || call.created_at).toLocaleString()}</span>
                            <span className="font-mono">${Number(call.costUsdc || call.cost_usdc || 0).toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Try It Sidebar */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-body text-heading-sm font-semibold">Try It Live</h3>

              {/* File Upload Dropzone */}
              <div
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={handleTry}
                role="button"
                tabIndex={0}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-body text-body-sm text-muted-foreground">
                  Drop a file or click to test
                </p>
              </div>

              <Button variant="default" className="w-full" onClick={handleTry} disabled={tryLoading}>
                {tryLoading ? <Spinner size="sm" /> : <><Play className="h-4 w-4 mr-1" /> Run</>}
              </Button>
              {tryResult && (
                <div className="rounded-xl bg-ink p-4 font-mono text-caption text-white/80 relative">
                  <CopyButton text={JSON.stringify(tryResult, null, 2)} className="absolute top-2 right-2 text-white/40" />
                  <pre className="whitespace-pre-wrap">{JSON.stringify(tryResult, null, 2)}</pre>
                </div>
              )}

              {/* MCP Command (web-only) */}
              <div className="rounded-xl bg-muted p-3 text-xs">
                <div className="mb-1 text-muted-foreground">MCP command</div>
                <code className="break-all">{mcpCommand}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Agents */}
        {similar.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-heading-lg font-bold text-foreground mb-8">Similar Services</h2>
            <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
              {similar.map((a) => (
                <Link key={a.id} to={`/explore/${a.id}`}><AgentCard agent={a} /></Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default AgentDetail;
