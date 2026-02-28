"use client";

import { useState } from "react";
import { IndianRupee, Loader2, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PRESETS = [100, 250, 500, 1000, 2500];
const USD_INR_RATE = 83;

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayTopupProps {
  onSuccess?: () => void;
}

export function RazorpayTopup({ onSuccess }: RazorpayTopupProps) {
  const [amountInr, setAmountInr] = useState(500);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [simulatedBalance, setSimulatedBalance] = useState<number | null>(null);

  const estimatedUsdc = (amountInr / USD_INR_RATE).toFixed(4);

  async function loadRazorpayScript(): Promise<boolean> {
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Simulation mode — instant success without real payment
  async function handleSimulate() {
    setSimulating(true);
    await new Promise((r) => setTimeout(r, 1400)); // fake processing delay
    const usdc = amountInr / USD_INR_RATE;
    setSimulatedBalance(usdc);
    setCompleted(true);
    toast.success(`Simulated: ₹${amountInr} → ${usdc.toFixed(4)} USDC credited!`);
    onSuccess?.();
    setSimulating(false);
  }

  async function handleTopup() {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load Razorpay. Try the simulation instead.");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const apiKey = localStorage.getItem("stoa_api_key");
      const token = localStorage.getItem("stoa_token");

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["X-Stoa-Key"] = apiKey;
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const orderRes = await fetch(`${apiUrl}/api/wallet/topup/razorpay`, {
        method: "POST",
        headers,
        body: JSON.stringify({ amountInr }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Failed to create order");
      }

      const { orderId, razorpayKeyId } = await orderRes.json();

      const options = {
        key: razorpayKeyId,
        amount: amountInr * 100,
        currency: "INR",
        name: "Stoa",
        description: `Top up ~${estimatedUsdc} USDC`,
        order_id: orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch(`${apiUrl}/api/wallet/topup/razorpay/verify`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amountInr,
            }),
          });
          if (verifyRes.ok) {
            setCompleted(true);
            toast.success(`Payment verified! ~${estimatedUsdc} USDC credited.`);
            onSuccess?.();
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {},
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold">Payment Successful!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {simulatedBalance !== null ? `+${simulatedBalance.toFixed(4)} USDC` : `~${estimatedUsdc} USDC`}{" "}
            credited to your wallet
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => { setCompleted(false); setSimulatedBalance(null); }}>
            Top up again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <IndianRupee className="h-4 w-4" />
          Top Up with INR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset amounts */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((amount) => (
            <Button key={amount} variant={amountInr === amount ? "default" : "outline"} size="sm" onClick={() => setAmountInr(amount)}>
              ₹{amount}
            </Button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="flex gap-2 items-center">
          <span className="text-lg font-semibold">₹</span>
          <Input type="number" min={100} max={50000} value={amountInr} onChange={(e) => setAmountInr(Number(e.target.value) || 0)} className="w-32" />
          <span className="text-sm text-muted-foreground">
            ≈ <span className="font-mono">{estimatedUsdc}</span> USDC
          </span>
        </div>

        <p className="text-xs text-muted-foreground">Rate: 1 USD = ₹{USD_INR_RATE} (demo fixed rate)</p>

        {/* ⚡ Simulation button — instant for hackathon demo */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
          <p className="text-xs font-medium text-primary flex items-center gap-1">
            <Zap className="h-3 w-3" /> Demo / Hackathon Mode
          </p>
          <Button className="w-full gap-2" variant="default" onClick={handleSimulate} disabled={simulating || amountInr < 100}>
            {simulating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing payment...</>
            ) : (
              <><Zap className="h-4 w-4" /> Simulate ₹{amountInr} payment (instant)</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Instantly credits {estimatedUsdc} USDC without a real transaction.
          </p>
        </div>

        {/* Real Razorpay button */}
        <Button className="w-full gap-2" variant="outline" onClick={handleTopup} disabled={loading || amountInr < 100}>
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Opening Razorpay...</>
          ) : (
            <><IndianRupee className="h-4 w-4" /> Pay ₹{amountInr} via Razorpay (real)</>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">UPI</Badge>
          <Badge variant="outline" className="text-xs">Cards</Badge>
          <Badge variant="outline" className="text-xs">Netbanking</Badge>
          <Badge variant="outline" className="text-xs">Wallets</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
