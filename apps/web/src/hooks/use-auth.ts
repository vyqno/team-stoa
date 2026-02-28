"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { auth } from "@/lib/api";

interface User {
  id: string;
  email: string;
  walletAddress: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

interface AuthContext {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<string>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => "",
  logout: () => {},
  setUser: () => {},
});

export function useAuth() {
  return useContext(AuthCtx);
}

export { AuthCtx };

export function useAuthProvider(): AuthContext {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("stoa_token");
    const apiKey = localStorage.getItem("stoa_api_key");
    if (!token && !apiKey) {
      setLoading(false);
      return;
    }
    auth
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("stoa_token");
        localStorage.removeItem("stoa_api_key");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await auth.login(email, password);
    localStorage.setItem("stoa_token", res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await auth.register(email, password);
    // Store both token and API key so subsequent requests are authenticated
    if ((res as any).token) {
      localStorage.setItem("stoa_token", (res as any).token);
    }
    localStorage.setItem("stoa_api_key", res.apiKey);
    setUser(res.user);
    return res.apiKey;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("stoa_token");
    localStorage.removeItem("stoa_api_key");
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, setUser };
}
