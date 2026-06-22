"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "dokter" | "staff" | "customer";
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (_email: string, _password: string) => Promise<{ success: boolean; error?: string }>;
  register: (_data: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (_email: string, _password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: _email, password: _password }),
      });

      const json = await res.json();

      if (!res.ok) {
        return { success: false, error: json.error ?? "Terjadi kesalahan" };
      }

      setUser(json.data);
      return { success: true };
    } catch {
      return { success: false, error: "Terjadi kesalahan koneksi" };
    }
  };

  const register = async (_data: { email: string; password: string; name: string; phone?: string }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(_data),
      });

      const json = await res.json();

      if (!res.ok) {
        return { success: false, error: json.error ?? "Terjadi kesalahan" };
      }

      setUser(json.data);
      return { success: true };
    } catch {
      return { success: false, error: "Terjadi kesalahan koneksi" };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}