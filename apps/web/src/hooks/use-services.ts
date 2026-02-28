"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { services, activity, wallet, auth, providers } from "@/lib/api";

// ── Services ──
export function useServices(params?: {
  category?: string;
  serviceType?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  userId?: string;
}) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => services.list(params),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () => services.get(id),
    enabled: !!id,
  });
}

export function useServiceSearch(query: string, category?: string) {
  return useQuery({
    queryKey: ["service-search", query, category],
    queryFn: () => services.search(query, category),
    enabled: query.length >= 2,
  });
}

export function useRegisterService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => services.register(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      services.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

// ── Activity ──
export function useActivity(limit?: number) {
  return useQuery({
    queryKey: ["activity", limit],
    queryFn: () => activity.list(limit),
    refetchInterval: 10000,
  });
}

// ── Wallet ──
export function useWalletBalance() {
  return useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => wallet.balance(),
  });
}

export function useWalletUsage() {
  return useQuery({
    queryKey: ["wallet-usage"],
    queryFn: () => wallet.usage(),
  });
}

export function useWalletTransactions(limit?: number) {
  return useQuery({
    queryKey: ["wallet-transactions", limit],
    queryFn: () => wallet.transactions(limit),
  });
}

// ── Auth ──
export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => auth.me(),
    retry: false,
  });
}

// ── Provider ──
export function useProvider(userId: string) {
  return useQuery({
    queryKey: ["provider", userId],
    queryFn: () => providers.get(userId),
    enabled: !!userId,
  });
}

export function useProviderServices(userId: string) {
  return useQuery({
    queryKey: ["provider-services", userId],
    queryFn: () => providers.services(userId),
    enabled: !!userId,
  });
}
