"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [isLoading, setIsLoading] = useState(true);

  // Check active session on initial load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setRole(data.user.role as UserRole);
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const switchRole = (newRole: UserRole) => {
    // Permitted if user is ADMIN / FOUNDER or if newRole is one of their assigned roles
    const isAllowed =
      user &&
      (user.role === "ADMIN" ||
        user.role === "FOUNDER" ||
        (user.roles && user.roles.includes(newRole)));

    if (isAllowed) {
      setRole(newRole);
      localStorage.setItem("repsi_active_role", newRole);
      if (typeof document !== "undefined") {
        document.cookie = `repsi_role=${newRole}; path=/; max-age=2592000`;
      }
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return {
          success: false,
          error: data.error || "Authentication failed. Please verify your credentials.",
        };
      }

      setUser(data.user);
      setRole(data.user.role as UserRole);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Authentication network error.";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue cleanup
    } finally {
      setUser(null);
      localStorage.removeItem("repsi_active_role");
      if (typeof document !== "undefined") {
        document.cookie = "repsi_role=; path=/; max-age=0";
        document.cookie = "repsi_session=; path=/; max-age=0";
        document.cookie = "repsi_user_email=; path=/; max-age=0";
      }
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, switchRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
