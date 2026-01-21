import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type UserPublic } from "./api";
import { loadAuth, saveAuth } from "./storage";

type AuthState = {
  token: string | null;
  user: UserPublic | null;
  isLoading: boolean;
  error: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => loadAuth()?.token ?? null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh(nextToken: string | null) {
    setIsLoading(true);
    setError(null);
    try {
      if (!nextToken) {
        setUser(null);
        return;
      }
      const me = await api.users.me(nextToken);
      setUser(me);
    } catch (e: any) {
      setUser(null);
      setToken(null);
      saveAuth(null);
      setError(e?.message ?? "Session expired. Please log in again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoading,
      error,
      login: async (newToken: string) => {
        setToken(newToken);
        saveAuth({ token: newToken });
        await refresh(newToken);
      },
      logout: () => {
        setToken(null);
        setUser(null);
        saveAuth(null);
      },
    }),
    [token, user, isLoading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

