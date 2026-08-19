"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthResponse, User, authApi } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "tripmate.auth";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((response: AuthResponse) => {
    setUser(response.user);
    setToken(response.token);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AuthResponse;
      setUser(parsed.user);
      setToken(parsed.token);
      authApi
        .me(parsed.token)
        .then(setUser)
        .catch(logout)
        .finally(() => setLoading(false));
    } catch {
      logout();
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      persist(await authApi.login({ email, password }));
    },
    [persist],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      persist(await authApi.register({ name, email, password }));
    },
    [persist],
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
