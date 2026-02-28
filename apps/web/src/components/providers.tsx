"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import { useState, type ReactNode, createElement } from "react";
import { AuthCtx, useAuthProvider } from "@/hooks/use-auth";

function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  return createElement(AuthCtx.Provider, { value: auth }, children);
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <ThirdwebProvider autoConnect={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}
