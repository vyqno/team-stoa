"use client";

import { useState, useEffect } from "react";
import { Key, Copy, Trash2, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ApiKeyInfo {
  id: string;
  keyPrefix: string;
  label: string;
  createdAt: string;
  revokedAt: string | null;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchKeys() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("stoa_token");
      const apiKey = localStorage.getItem("stoa_api_key");

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (apiKey) headers["X-Stoa-Key"] = apiKey;

      const res = await fetch(`${apiUrl}/api/auth/keys`, { headers });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch {
      // Keys endpoint may not exist yet
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const storedKey = typeof window !== "undefined" ? localStorage.getItem("stoa_api_key") : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="h-4 w-4" />
          API Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {storedKey && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm font-mono flex-1">
              {storedKey.slice(0, 12)}{"*".repeat(20)}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                navigator.clipboard.writeText(storedKey);
                toast.success("API key copied!");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {activeKeys.length > 0 && (
          <div className="space-y-2">
            {activeKeys.map((k) => (
              <div
                key={k.id}
                className="flex items-center gap-2 p-2 border rounded text-sm"
              >
                <span className="font-mono text-xs">{k.keyPrefix}...</span>
                <span className="text-muted-foreground flex-1">{k.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {new Date(k.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {!storedKey && activeKeys.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            No API keys found. Register at /connect to get one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
