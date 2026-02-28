"use client";

import { useEffect, useRef } from "react";
import { ConnectButton, useActiveAccount, useDisconnect } from "thirdweb/react";
import { useQueryClient } from "@tanstack/react-query";
import { thirdwebClient, CHAIN } from "@/lib/thirdweb";
import { wallet as walletApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Copy, Unplug, CheckCircle2 } from "lucide-react";

export function ConnectWallet() {
  const account = useActiveAccount();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const linkingRef = useRef(false);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!account?.address || !user || linkingRef.current) return;
    if (user.walletAddress === account.address) return;

    linkingRef.current = true;

    walletApi
      .link(account.address)
      .then(() => {
        setUser({ ...user, walletAddress: account.address });
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        toast.success("Wallet linked!");
      })
      .catch((err: Error) => {
        toast.error(err.message || "Failed to link wallet");
      })
      .finally(() => {
        linkingRef.current = false;
      });
  }, [account?.address, user]);

  if (account) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
        <code className="text-sm font-mono">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </code>
        <button
          onClick={() => { navigator.clipboard.writeText(account.address); toast.success("Copied!"); }}
          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => disconnect(account)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Unplug className="h-3.5 w-3.5" /> Disconnect
        </button>
      </div>
    );
  }

  return (
    <ConnectButton
      client={thirdwebClient}
      chain={CHAIN}
    />
  );
}
