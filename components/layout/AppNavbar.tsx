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
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import { opsStore } from "@/lib/services/ops-store";

interface AppNavbarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
}

export function AppNavbar({ onOpenSearch, onOpenMobileMenu }: AppNavbarProps) {
  const { user, role, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();

  const notifications = opsStore.getNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
    <header className="h-16 px-4 md:px-6 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between gap-4 sticky top-0 z-30">
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

      {/* Right controls: Role Persona Switcher, Notifications, User */}
      <div className="flex items-center gap-2.5 md:gap-3">
        {/* Role Persona Switcher (For Development & Demonstration) */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors"
            title="Fast Role Switcher (Simulate all team roles)"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-medium">Role:</span>
            <span className="font-semibold text-emerald-400">{ROLE_LABELS[role]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Role Persona
              </div>
              <div className="py-1">
                {availableRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200"
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

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
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
                {notifications.map((n) => (
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
            {user?.name ? user.name[0] : "R"}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">
              {user?.name || "Ops Engineer"}
            </div>
            <div className="text-[10px] text-slate-400 leading-none mt-0.5">
              {user?.email || "ops@repsi.app"}
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
