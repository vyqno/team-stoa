import { useMemo, useState } from "react";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Key, BarChart3, ChevronLeft, DollarSign, Zap, Bot, Clock, ExternalLink, LogOut, Copy, Unplug } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  useProviderServices,
  useWalletBalance,
  useWalletUsage,
  useWalletTransactions,
  useActivity,
} from "@/hooks/use-services";
import { ApiKeyManager } from "@/components/wallet/api-key-manager";
import { RazorpayTopup } from "@/components/wallet/razorpay-topup";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { useActiveAccount, useDisconnect, useActiveWalletChain, useWalletBalance as useThirdwebWalletBalance } from "thirdweb/react";
import { thirdwebClient, CHAIN, USDC_ADDRESS } from "@/lib/thirdweb";
import { toast } from "sonner";

const NAV = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Wallet", path: "/dashboard/wallet", icon: Wallet },
  { label: "API Keys", path: "/dashboard/api-keys", icon: Key },
  { label: "Usage", path: "/dashboard/usage", icon: BarChart3 },
];

/* ─── Dashboard Layout with Collapsible Sidebar ─── */

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background pt-[72px] flex">
      {/* Sidebar (Desktop) */}
      <aside className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* User info */}
        {!collapsed && user && (
          <div className="p-4 border-b border-border">
            <p className="text-sm font-medium truncate">{user.displayName || user.email}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <div className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-body-sm transition-colors",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
        {/* Logout + Collapse */}
        <div className="border-t border-border">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors",
              collapsed && "justify-center"
            )}
            title="Log out"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full p-3 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
      </aside>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] bg-card border-t border-border flex">
        {NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="p-6 md:p-10 max-w-6xl">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview Sub-page ─── */

function Overview() {
  const { user } = useAuth();
  const { data: walletData } = useWalletBalance();
  const { data: myServices } = useProviderServices(user?.id ?? "");
  const { data: usageData } = useWalletUsage();
  const { data: activityData } = useActivity(20);

  // Build chart data from recent activity
  const chartData = useMemo(() => {
    const list = activityData?.activity ?? [];
    if (list.length === 0) return [];

    const grouped: Record<string, number> = {};
    list.forEach((a: any) => {
      const date = new Date(a.createdAt || a.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([day, calls]) => ({ day, calls }));
  }, [activityData?.activity]);

  const activityList = activityData?.activity ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-heading-lg font-bold text-foreground">
          Good morning{user?.displayName ? `, ${user.displayName}` : ""}.
        </h1>
        <p className="font-body text-body-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Balance" value={`$${(walletData?.balanceUsdc ?? 0).toFixed(4)}`} />
        <StatCard icon={Zap} label="Total Calls" value={String(usageData?.totalCalls ?? 0)} />
        <StatCard icon={Bot} label="My Services" value={String(myServices?.services?.length ?? 0)} />
        <StatCard icon={Clock} label="Services Used" value={String(usageData?.servicesUsed ?? 0)} />
      </div>

      {/* Usage Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-body text-heading-sm font-semibold mb-4">Usage (recent)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(70 47% 54%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(70 47% 54%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="calls" stroke="hsl(70 47% 54%)" fill="url(#gradCalls)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-body text-heading-sm font-semibold">Recent Activity</h3>
        </div>
        {activityList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr className="font-body text-caption text-muted-foreground">
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Service</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {activityList.slice(0, 10).map((a: any) => (
                  <tr key={a.id} className="border-t border-border font-body text-body-sm">
                    <td className="p-3 text-muted-foreground">
                      {new Date(a.createdAt || a.created_at || Date.now()).toLocaleString()}
                    </td>
                    <td className="p-3">{a.serviceName || a.service_name || a.serviceId || a.service_id}</td>
                    <td className="p-3 font-mono text-primary">{Number(a.costUsdc || a.cost_usdc || 0).toFixed(4)} USDC</td>
                    <td className="p-3">
                      <span className={cn(
                        "rounded-pill px-2 py-0.5 text-caption font-medium",
                        (a.status === "success" || a.status === "completed") ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      )}>{a.status || "success"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">No recent activity yet.</div>
        )}
      </div>

      {/* My Services */}
      {(myServices?.services?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">My Services</h3>
          <div className="space-y-2">
            {myServices!.services.slice(0, 8).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b border-border/60 py-2">
                <span>{s.name}</span>
                <span className="font-mono">${Number(s.priceUsdcPerCall || 0).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Wallet Sub-page ─── */

function WalletPage() {
  const { data: walletData, refetch: refetchWallet } = useWalletBalance();
  const [showTopup, setShowTopup] = useState(false);
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const { disconnect } = useDisconnect();

  // Use ThirdWeb's native wallet balance hook — reads USDC on Base Sepolia directly
  const { data: twBalance, isLoading: balLoading, refetch: refetchBal } = useThirdwebWalletBalance({
    client: thirdwebClient,
    chain: CHAIN,
    address: account?.address,
    tokenAddress: USDC_ADDRESS,
  });

  // On-chain USDC from ThirdWeb (most accurate)
  const onchainUsdc = twBalance ? Number(twBalance.displayValue) : 0;
  // Prefer on-chain; fall back to backend balance
  const totalBalance = !balLoading && onchainUsdc > 0 ? onchainUsdc : (walletData?.balanceUsdc ?? 0);

  // Display address: backend CDP wallet or connected ThirdWeb wallet
  const displayAddress = walletData?.address || account?.address;

  const shortenAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-heading-lg font-bold">Wallet</h2>

      {/* ── Balance Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 p-8">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Total Balance</p>
          <div className="flex items-end gap-3 mb-1">
            {balLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-10 w-48 rounded-lg bg-primary/10 animate-pulse" />
              </div>
            ) : (
              <>
                <span className="text-5xl font-bold font-mono tabular-nums tracking-tight">
                  {totalBalance.toFixed(4)}
                </span>
                <span className="text-2xl font-semibold text-muted-foreground mb-1">USDC</span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">on Base Sepolia testnet</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => { refetchBal(); refetchWallet(); }}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              Refresh
            </button>
            <button
              onClick={() => setShowTopup((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              + Top Up with INR
            </button>
            {displayAddress && (
              <a
                href={`https://sepolia.basescan.org/address/${displayAddress}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> BaseScan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Top-up panel */}
      {showTopup && (
        <RazorpayTopup onSuccess={() => { refetchWallet(); refetchBal(); }} />
      )}

      {/* ── Connected Wallet Card ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Connected Wallet</p>
            <p className="text-xs text-muted-foreground">{chain?.name || "Base Sepolia"}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>

        {account ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Address</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-semibold">{shortenAddr(account.address)}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(account.address); toast.success("Address copied!"); }}
                    className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <code className="text-xs text-muted-foreground font-mono">{account.address}</code>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">On-chain USDC</p>
                <p className="text-3xl font-bold font-mono tabular-nums text-primary">
                  {balLoading ? <span className="text-xl animate-pulse">...</span> : onchainUsdc.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" className="gap-1.5 h-8" asChild>
                <a href={`https://sepolia.basescan.org/address/${account.address}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> View on BaseScan
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 h-8" asChild>
                <a href="https://faucet.circle.com/" target="_blank" rel="noreferrer">
                  Get Testnet USDC
                </a>
              </Button>
              <Button
                variant="ghost" size="sm"
                className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => disconnect(account)}
              >
                <Unplug className="h-3.5 w-3.5" /> Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-10">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium mb-1">No wallet connected</p>
              <p className="text-sm text-muted-foreground">Connect to see your on-chain balance</p>
            </div>
            <ConnectWallet />
          </div>
        )}
      </div>

      {/* ── Stoa Wallet (backend-managed) ── */}
      {walletData?.address && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h3 className="font-semibold text-sm">Stoa-managed Wallet</h3>
            <span className="ml-auto text-xs text-muted-foreground">CDP</span>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono break-all">{walletData.address}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(walletData.address!); toast.success("Copied!"); }}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-1">Balance</p>
              <p className="text-xl font-mono font-bold">{(walletData.balanceUsdc ?? 0).toFixed(4)} USDC</p>
            </div>
          </div>
          <a
            href={`https://sepolia.basescan.org/address/${walletData.address}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View on BaseScan <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── API Keys Sub-page ─── */

function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-heading-lg font-bold">API Keys</h2>
      <ApiKeyManager />
    </div>
  );
}

/* ─── Usage Sub-page ─── */

function UsagePage() {
  const { data: usageData } = useWalletUsage();
  const { data: txData } = useWalletTransactions(20);

  // Build chart data from transactions
  const chartData = useMemo(() => {
    const txs = txData?.transactions ?? [];
    if (txs.length === 0) return [];

    const grouped: Record<string, number> = {};
    txs.forEach((tx: any) => {
      const date = new Date(tx.createdAt || tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([day, calls]) => ({ day, calls }));
  }, [txData?.transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-heading-lg font-bold">Usage</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard icon={BarChart3} label="Total Calls" value={String(usageData?.totalCalls ?? 0)} />
        <StatCard icon={Wallet} label="Total Spent" value={`$${(usageData?.totalSpentUsdc ?? 0).toFixed(4)}`} />
        <StatCard icon={LayoutDashboard} label="Services Used" value={String(usageData?.servicesUsed ?? 0)} />
      </div>

      {/* Usage Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-body text-heading-sm font-semibold mb-4">Calls over time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(70 47% 54%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(70 47% 54%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="calls" stroke="hsl(70 47% 54%)" fill="url(#gradUsage)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-3">Recent Transactions</h3>
        {txData?.transactions?.length ? (
          <div className="space-y-2">
            {txData.transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between text-sm border-b border-border/60 py-2">
                <span>{new Date(tx.createdAt || tx.created_at).toLocaleString()}</span>
                <span className="font-mono">${Number(tx.costUsdc || tx.cost_usdc || 0).toFixed(4)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard Component ─── */

export default function Dashboard() {
  const { user, loading } = useAuth();
  const account = useActiveAccount();
  const isAuthenticated = !!user || !!account?.address;

  if (loading && !account) {
    return <main className="min-h-screen bg-background pt-[72px] px-6 py-12">Loading...</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background pt-[72px] px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">Connect your wallet to access your dashboard</h2>
        <p className="text-muted-foreground mb-6">Manage services, wallet, and API keys.</p>
        <Link to="/connect"><Button size="lg">Go to Connect</Button></Link>
      </main>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="api-keys" element={<ApiKeysPage />} />
        <Route path="usage" element={<UsagePage />} />
      </Routes>
    </DashboardLayout>
  );
}
