"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  UserCheck,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme/context";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { opsStore } from "@/lib/services/ops-store";

interface AppNavbarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
}

export function AppNavbar({ onOpenSearch, onOpenMobileMenu }: AppNavbarProps) {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();

  const notifications = opsStore.getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const isAdmin = user?.role === "ADMIN" || user?.role === "FOUNDER";

  const handleRoleSelect = (r: UserRole) => {
    switchRole(r);
    setRoleMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const availableRoles: UserRole[] = [
    "ADMIN",
    "SALES",
    "PROJECT_MANAGER",
    "DEVELOPER",
    "QA",
    "MARKETING",
    "CUSTOMER_SUCCESS",
  ];

  return (
    <header className="h-16 px-4 md:px-6 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors">
      {/* Mobile toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition-all group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-emerald-400" />
            <span className="truncate group-hover:text-slate-300">
              Search gyms, owner, tasks, bug ID, modules...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right controls: Theme Toggle, Role Badge, Notifications, User */}
      <div className="flex items-center gap-2.5 md:gap-3">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark and light mode"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800 transition-all flex items-center justify-center group"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Role Badge / Switcher (Admin preview only) */}
        {isAdmin ? (
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-slate-200 transition-colors"
              title="Admin Role (Click to preview other role perspectives)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-slate-400 font-medium">Role:</span>
              <span className="font-semibold text-emerald-400">{ROLE_LABELS[role]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Role Preview (Admin)</span>
                  <span className="text-emerald-400 text-[9px] font-mono">RBAC</span>
                </div>
                <div className="py-1">
                  {availableRoles.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200 transition-colors"
                    >
                      <span>{ROLE_LABELS[r]}</span>
                      {role === r && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : user?.roles && user.roles.length > 1 ? (
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-colors"
              title="Click to switch your active role view"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-400">{ROLE_LABELS[role]}</span>
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-full bg-slate-700/60 font-mono">
                +{user.roles.length - 1}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Your Assigned Roles
                </div>
                <div className="py-1">
                  {user.roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r as UserRole)}
                      className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200 transition-colors"
                    >
                      <span>{ROLE_LABELS[r as UserRole] || r}</span>
                      {role === r && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">{ROLE_LABELS[role]}</span>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-800"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Internal Notifications
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        opsStore.markNotificationRead(n.id);
                        setNotifOpen(false);
                        if (n.link) router.push(n.link);
                      }}
                      className="p-3 hover:bg-slate-800/60 cursor-pointer transition-colors text-left"
                    >
                      <div className="text-xs font-semibold text-white flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">Just now</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
            {user?.name ? user.name[0] : (user?.email ? user.email[0].toUpperCase() : "A")}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">
              {user?.name || "Admin"}
            </div>
            <div className="text-[10px] text-slate-400 leading-none mt-0.5">
              {user?.email || "contact@repsi.app"}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 ml-1 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
