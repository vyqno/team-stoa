import { useState } from "react";
import {
  Copy, Key, Wallet, Package, Eye, EyeOff, LogIn, UserPlus, Download,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useActiveAccount } from "thirdweb/react";
import { ConnectButton } from "thirdweb/react";
import { thirdwebClient, CHAIN } from "@/lib/thirdweb";
import { ConnectWallet } from "@/components/wallet/connect-wallet";
import { ApiKeyManager } from "@/components/wallet/api-key-manager";
import { toast } from "sonner";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const wallets = [
  inAppWallet({ auth: { options: ["google", "email", "phone"] } }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

export default function ConnectPage() {
  const account = useActiveAccount();
  const { user, login, register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [submitting, setSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const isWalletConnected = !!account?.address;
  const isAuthenticated = !!user || isWalletConnected;

  async function handleAuth() {
    setSubmitting(true);
    try {
      if (authTab === "register") {
        const key = await register(email, password);
        setApiKey(key);
        localStorage.setItem("stoa_api_key", key);
        toast.success("Account created! Save your API key.");
      } else {
        await login(email, password);
        toast.success("Logged in!");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const mcpConfig = JSON.stringify(
    { mcpServers: { stoa: { command: "npx", args: ["@stoa/mcp-server"], env: { STOA_API_KEY: apiKey || "stoa_YOUR_KEY_HERE" } } } },
    null, 2
  );

  function downloadConfig() {
    const blob = new Blob([mcpConfig], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claude_desktop_config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Config downloaded!");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 pt-[92px]">
      <h1 className="text-3xl font-bold mb-2">Connect to Stoa</h1>
      <p className="text-muted-foreground mb-8">Set up your account, wallet, and connect your AI assistant</p>

      {/* ─── Step 1: Auth ─── */}
      {isAuthenticated ? (
        <Card className="mb-8 border-green-500/30 bg-green-500/5">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              {user ? (
                <>
                  <Badge variant="secondary" className="gap-1"><Key className="h-3 w-3" /> Authenticated</Badge>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="gap-1"><Wallet className="h-3 w-3" /> Wallet Connected</Badge>
                  <code className="text-xs font-mono text-muted-foreground">
                    {account?.address?.slice(0, 10)}...{account?.address?.slice(-6)}
                  </code>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
              Sign Up or Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center [&_button]:!w-full">
              <ConnectButton client={thirdwebClient} chain={CHAIN} wallets={wallets} connectButton={{ label: "Connect Wallet / Sign in with Google", className: "!w-full" }} />
            </div>
            <div className="relative"><Separator /><span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">or use email</span></div>
            <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="register" className="flex-1 gap-2"><UserPlus className="h-4 w-4" /> Register</TabsTrigger>
                <TabsTrigger value="login" className="flex-1 gap-2"><LogIn className="h-4 w-4" /> Login</TabsTrigger>
              </TabsList>
              <TabsContent value="register" className="space-y-3 mt-4">
                <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button className="w-full" onClick={handleAuth} disabled={submitting}>{submitting ? "Creating..." : "Create Account"}</Button>
              </TabsContent>
              <TabsContent value="login" className="space-y-3 mt-4">
                <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button className="w-full" onClick={handleAuth} disabled={submitting}>{submitting ? "Logging in..." : "Login"}</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {apiKey && (
        <Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4 text-yellow-600" />Your API Key — Save it now!</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">This key will not be shown again.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input value={showKey ? apiKey : "stoa_" + "*".repeat(32)} readOnly className="font-mono text-sm pr-20" />
                <Button size="icon" variant="ghost" className="absolute right-8 top-0 h-full" onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success("Copied!"); }}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Step 2: Wallet ─── */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
            Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <div className="space-y-3">
              <ConnectWallet />
              {!account?.address && (
                <p className="text-sm text-muted-foreground">Connect your wallet above to get started.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sign in first to connect your wallet</p>
          )}
        </CardContent>
      </Card>

      {user && <div className="mb-8"><ApiKeyManager /></div>}

      {/* ─── Step 3: Claude Desktop ─── */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
            Connect to Claude Desktop
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Download or copy the config below</li>
            <li>Place in <code className="bg-muted px-1 rounded text-xs">~/.claude/</code> or open Claude Desktop → Settings → MCP</li>
            <li>Restart Claude Desktop</li>
          </ol>
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="gap-2" onClick={downloadConfig}><Download className="h-4 w-4" /> Download Config</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { navigator.clipboard.writeText(mcpConfig); toast.success("Config copied!"); }}><Copy className="h-4 w-4" /> Copy Config</Button>
          </div>
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto">{mcpConfig}</pre>
        </CardContent>
      </Card>

      {/* ─── Step 4: SDK ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
            Connect via SDK
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm"><Package className="h-4 w-4" /><code className="bg-muted rounded px-2 py-1 text-xs">npm install @stoa/agent-sdk</code></div>
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto">{`import { StoaClient } from "@stoa/agent-sdk";\n\nconst stoa = new StoaClient({ apiKey: "${apiKey || "stoa_YOUR_KEY_HERE"}" });\n\nconst results = await stoa.search("chest xray analysis");\nconst result = await stoa.call(results[0].id, { image_url: "https://..." });`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}