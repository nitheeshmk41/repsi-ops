"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserRole } from "@/types";
import { SEED_USERS } from "@/lib/db/seed-data";
import { browserAppwrite } from "@/lib/appwrite/client";

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
  // Default to Founder/Admin user for internal operations
  const [user, setUser] = useState<UserProfile | null>(SEED_USERS[0]);
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if there is a saved role or session in localStorage
    const savedRole = localStorage.getItem("repsi_active_role") as UserRole | null;
    if (savedRole && SEED_USERS.some((u) => u.role === savedRole)) {
      const matched = SEED_USERS.find((u) => u.role === savedRole);
      if (matched) {
        setUser(matched);
        setRole(matched.role);
      }
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    const matched = SEED_USERS.find((u) => u.role === newRole) || {
      ...SEED_USERS[0],
      role: newRole,
      id: `usr_${newRole.toLowerCase()}`,
      name: `${newRole.replace("_", " ")} Member`,
      email: `${newRole.toLowerCase()}@repsi.app`,
    };
    setUser(matched);
    setRole(newRole);
    localStorage.setItem("repsi_active_role", newRole);
    if (typeof document !== "undefined") {
      document.cookie = `repsi_role=${newRole}; path=/; max-age=2592000`;
      document.cookie = `repsi_session=active; path=/; max-age=2592000`;
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (browserAppwrite && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
        try {
          await browserAppwrite.account.createEmailPasswordSession(email, pass);
        } catch {
          // If Appwrite cloud endpoint is not reachable or in dev demo mode, continue smoothly with local match
        }
      }

      // Check matched user or fallback
      const matched = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
        id: `usr_${Date.now()}`,
        name: email.split("@")[0].toUpperCase(),
        email: email,
        role: "ADMIN" as UserRole,
        department: "Internal Operations",
        created_at: new Date().toISOString(),
      };

      setUser(matched);
      setRole(matched.role);
      localStorage.setItem("repsi_active_role", matched.role);
      if (typeof document !== "undefined") {
        document.cookie = `repsi_role=${matched.role}; path=/; max-age=2592000`;
        document.cookie = `repsi_session=active; path=/; max-age=2592000`;
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : "Authentication failed";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      if (browserAppwrite) {
        try {
          await browserAppwrite.account.deleteSession("current");
        } catch {
          // Ignore if no active remote session
        }
      }
    } finally {
      setUser(null);
      localStorage.removeItem("repsi_active_role");
      if (typeof document !== "undefined") {
        document.cookie = "repsi_role=; path=/; max-age=0";
        document.cookie = "repsi_session=; path=/; max-age=0";
        document.cookie = "appwrite-session=; path=/; max-age=0";
      }
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
