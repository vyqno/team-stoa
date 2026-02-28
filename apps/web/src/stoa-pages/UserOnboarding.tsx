import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/Spinner";
import { cn } from "@/lib/utils";

const UserOnboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectedTo, setConnectedTo] = useState<string | null>(null);

  useEffect(() => { document.title = "Get Started — Stoa"; }, []);

  const isFormValid = name.trim() && email.trim() && password.length >= 8 && password === confirm;

  const handleConnect = (client: string) => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnectedTo(client);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-background pt-[72px] px-6 py-12 flex items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Dot Progress */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded-full transition-all duration-300",
                i === step ? "bg-primary scale-125" : i < step ? "bg-primary/50" : "border-2 border-border"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Signup */}
          {step === 0 && (
            <motion.div key="u1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-5">
              <h2 className="font-display text-display-sm font-bold text-center">Let's get you set up.</h2>
              <p className="font-body text-body-md text-muted-foreground text-center">Create your account to get started.</p>
              <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              {password && confirm && password !== confirm && (
                <p className="font-body text-caption text-destructive">Passwords don't match</p>
              )}
              <Button variant="default" className="w-full" disabled={!isFormValid} onClick={() => setStep(1)}>
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Connect to Claude or ChatGPT */}
          {step === 1 && !connectedTo && (
            <motion.div key="u2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center space-y-6">
              <h2 className="font-display text-heading-lg font-bold">Connect your AI client</h2>
              <p className="font-body text-body-md text-muted-foreground">
                Choose which client to connect Stoa agents to.
              </p>
              <div className="grid gap-4">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full h-14 text-body-md"
                  onClick={() => handleConnect("Claude")}
                  disabled={connecting}
                >
                  {connecting ? <Spinner size="sm" /> : "Connect to Claude"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-14 text-body-md"
                  onClick={() => handleConnect("ChatGPT")}
                  disabled={connecting}
                >
                  {connecting ? <Spinner size="sm" /> : "Connect to ChatGPT"}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(0)}>Back</Button>
            </motion.div>
          )}

          {/* Connected */}
          {step === 1 && connectedTo && (
            <motion.div key="u3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                className="flex items-center justify-center"
              >
                <CheckCircle2 className="h-16 w-16 text-primary" strokeWidth={1.5} />
              </motion.div>
              <h2 className="font-display text-display-sm font-bold">You're all set!</h2>
              <p className="font-body text-body-md text-muted-foreground">
                Connected to {connectedTo} successfully.
              </p>
              <Link to="/dashboard">
                <Button variant="default" size="lg">Go to Dashboard</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default UserOnboarding;
