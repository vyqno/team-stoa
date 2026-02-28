import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, CheckCircle2, XCircle, Clock, DollarSign, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivity } from "@/hooks/use-services";
import { supabase } from "@/lib/supabase";

export default function ActivityPage() {
  const { data, isLoading } = useActivity(50);
  const [realtimeCalls, setRealtimeCalls] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel("call_logs_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "call_logs" }, (payload) => {
        setRealtimeCalls((prev) => [payload.new, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allCalls = [...realtimeCalls, ...(data?.activity ?? [])];
  const seen = new Set<string>();
  const calls = allCalls.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  const todayCalls = calls.filter((c) => {
    const d = new Date(c.createdAt || c.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const todayUsdc = todayCalls.reduce((sum, c) => sum + Number(c.costUsdc || c.cost_usdc || 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 pt-[92px]">
      <div className="flex items-center gap-3 mb-2"><Radio className="h-5 w-5 text-green-500 animate-pulse" /><h1 className="text-3xl font-bold">Live Activity</h1></div>
      <p className="text-muted-foreground mb-8">What AI agents are doing right now</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card><CardContent className="pt-4 pb-4 text-center"><p className="text-2xl font-bold">{todayCalls.length}</p><p className="text-sm text-muted-foreground">Calls today</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 text-center"><p className="text-2xl font-bold font-mono">${todayUsdc.toFixed(4)}</p><p className="text-sm text-muted-foreground">USDC today</p></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : calls.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">No activity yet.</p></div>
      ) : (
        <div className="space-y-2">
          {calls.map((call) => {
            const success = call.success ?? true;
            const cost = Number(call.costUsdc || call.cost_usdc || 0);
            const latency = call.latencyMs || call.latency_ms || 0;
            const time = new Date(call.createdAt || call.created_at);
            const serviceName = call.serviceName || call.service_name || call.serviceId || call.service_id;
            const serviceId = call.serviceId || call.service_id;
            const txHash = call.txHash || call.tx_hash;

            return (
              <div key={call.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                {success ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                <div className="flex-1 min-w-0">
                  <Link to={`/explore/${serviceId}`} className="font-medium hover:underline text-sm line-clamp-1">{serviceName}</Link>
                  <p className="text-xs text-muted-foreground">{time.toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-3 text-sm shrink-0">
                  <span className="font-mono flex items-center gap-1"><DollarSign className="h-3 w-3" />{cost.toFixed(4)}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{latency}ms</span>
                  <Badge variant={success ? "default" : "destructive"} className="text-xs">{success ? "OK" : "Fail"}</Badge>
                  {txHash && (
                    <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" title="View on BaseScan"><ExternalLink className="h-3.5 w-3.5" /></a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}