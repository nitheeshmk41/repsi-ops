"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Layers,
  CheckSquare,
  Bug,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Clock,
  Kanban,
  FileText,
  Target,
  FlaskConical,
} from "lucide-react";
import { RepsiLogo } from "@/components/shared/RepsiLogo";
import { useAuth } from "@/lib/auth/context";
import { canAccessRoute } from "@/lib/auth/rbac";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

export function AppSidebar({ onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const effectiveRoles = user?.roles && user.roles.length > 0 ? user.roles : role;
  const navContainerRef = useRef<HTMLDivElement>(null);

  // User manual overrides for collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !isSectionOpen(section),
    }));
  };

  const isSectionOpen = (section: string) => {
    if (collapsedSections[section] !== undefined) {
      return !collapsedSections[section];
    }
    if (section === "reports") {
      return pathname.startsWith("/reports");
    }
    return true;
  };

  // Restore sidebar scroll position once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navContainerRef.current) {
      const savedScroll = sessionStorage.getItem("sidebar_scroll_pos");
      if (savedScroll) {
        navContainerRef.current.scrollTop = Number(savedScroll);
      }
    }
  }, []);

  const handleScroll = () => {
    if (typeof window !== "undefined" && navContainerRef.current) {
      sessionStorage.setItem("sidebar_scroll_pos", String(navContainerRef.current.scrollTop));
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navItem = (href: string, label: string, icon: React.ReactNode, badge?: string | number, badgeColor?: string) => {
    if (!canAccessRoute(effectiveRoles, href)) return null;

    const active = isActive(href);
    return (
      <Link
        href={href}
        scroll={false}
        onClick={() => {
          if (navContainerRef.current) {
            sessionStorage.setItem("sidebar_scroll_pos", String(navContainerRef.current.scrollTop));
          }
          if (onCloseMobile) onCloseMobile();
        }}
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group",
          active
            ? "bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className={cn("transition-colors", active ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200")}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
              badgeColor || "bg-slate-800 text-slate-300 border border-slate-700"
            )}
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 h-screen bg-slate-950/90 border-r border-slate-800/80 flex flex-col select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 shrink-0">
        <RepsiLogo size="md" showDomain={true} />
      </div>

      {/* Nav List with Persistent Scroll */}
      <div
        ref={navContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
      >
        {/* Core Dashboard */}
        <div>
          {navItem("/dashboard", "Dashboard", <LayoutDashboard className="w-4 h-4" />)}
        </div>

        {/* Section 1: CRM */}
        {canAccessRoute(effectiveRoles, "/crm") && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("crm")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span>CRM</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSectionOpen("crm") ? "rotate-0" : "-rotate-90")} />
            </button>
            {isSectionOpen("crm") && (
              <div className="space-y-0.5 pl-1 pt-1">
                {navItem("/crm/leads", "Leads", <Target className="w-4 h-4" />)}
                {navItem("/crm/visits", "Visits", <CalendarDays className="w-4 h-4" />)}
                {navItem("/crm/follow-ups", "Follow-ups", <Clock className="w-4 h-4" />, 2, "bg-amber-500/20 text-amber-300 border border-amber-500/40")}
                {navItem("/crm/pipeline", "Pipeline", <Kanban className="w-4 h-4" />)}
                {navItem("/crm/feedback", "Feedback", <FileText className="w-4 h-4" />)}
              </div>
            )}
          </div>
        )}

        {/* Section 2: Sales */}
        {canAccessRoute(effectiveRoles, "/sales") && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("sales")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span>Sales</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSectionOpen("sales") ? "rotate-0" : "-rotate-90")} />
            </button>
            {isSectionOpen("sales") && (
              <div className="space-y-0.5 pl-1 pt-1">
                {navItem("/sales/today", "Today's Schedule", <CalendarDays className="w-4 h-4" />, 3, "bg-emerald-500/20 text-emerald-300")}
                {navItem("/sales/visits", "My Visits", <Building2 className="w-4 h-4" />)}
                {navItem("/sales/pipeline", "Sales Pipeline", <Kanban className="w-4 h-4" />)}
                {navItem("/sales/reports", "Sales Reports", <BarChart3 className="w-4 h-4" />)}
              </div>
            )}
          </div>
        )}

        {/* Section 3: Product */}
        {canAccessRoute(effectiveRoles, "/product") && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("product")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span>Product</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSectionOpen("product") ? "rotate-0" : "-rotate-90")} />
            </button>
            {isSectionOpen("product") && (
              <div className="space-y-0.5 pl-1 pt-1">
                {navItem("/product/modules", "Modules", <Layers className="w-4 h-4" />)}
                {navItem("/product/features", "Features", <CheckSquare className="w-4 h-4" />)}
                {navItem("/product/roadmap", "Roadmap", <Target className="w-4 h-4" />)}
                {navItem("/product/releases", "Releases", <Sparkles className="w-4 h-4" />, "v1.5.0", "bg-purple-500/20 text-purple-300")}
                {navItem("/product/feature-requests", "Feature Requests", <Sparkles className="w-4 h-4" />, 2, "bg-amber-500/20 text-amber-300")}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Project */}
        {canAccessRoute(effectiveRoles, "/project") && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("project")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span>Project</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSectionOpen("project") ? "rotate-0" : "-rotate-90")} />
            </button>
            {isSectionOpen("project") && (
              <div className="space-y-0.5 pl-1 pt-1">
                {navItem("/project/tasks", "Tasks", <CheckSquare className="w-4 h-4" />)}
                {navItem("/project/my-work", "My Work", <CheckSquare className="w-4 h-4" />)}
                {navItem("/project/workload", "Team Workload", <Users className="w-4 h-4" />)}
                {navItem("/project/blockers", "Blockers", <AlertTriangle className="w-4 h-4" />, 1, "bg-rose-500/20 text-rose-300 border border-rose-500/40")}
                {navItem("/project/daily-logs", "Daily Work Logs", <FileText className="w-4 h-4" />)}
              </div>
            )}
          </div>
        )}

        {/* Section 5: Bugs */}
        {canAccessRoute(effectiveRoles, "/bugs") && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("bugs")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span>Bugs</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSectionOpen("bugs") ? "rotate-0" : "-rotate-90")} />
            </button>
            {isSectionOpen("bugs") && (
              <div className="space-y-0.5 pl-1 pt-1">
                {navItem("/bugs/all", "All Bugs", <Bug className="w-4 h-4" />)}
                {navItem("/bugs/critical", "Critical Bugs", <AlertTriangle className="w-4 h-4" />, 1, "bg-red-500/20 text-red-300 border border-red-500/40")}
                {navItem("/bugs/my-bugs", "My Bugs", <Bug className="w-4 h-4" />)}
                {navItem("/bugs/qa", "QA Testing", <FlaskConical className="w-4 h-4" />)}
              </div>
            )}
          </div>
        )}

        {/* Section 6: Reports */}
        {canAccessRoute(effectiveRoles, "/reports") && (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection("reports")}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <span>Reports</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isSectionOpen("reports") ? "rotate-0" : "-rotate-90")} />
            </button>
            {isSectionOpen("reports") && (
              <div className="space-y-0.5 pl-1 pt-1">
                {navItem("/reports/sales", "Sales Report", <BarChart3 className="w-4 h-4" />)}
                {navItem("/reports/product", "Product Report", <Layers className="w-4 h-4" />)}
                {navItem("/reports/team", "Team Performance", <Users className="w-4 h-4" />)}
              </div>
            )}
          </div>
        )}

        {/* Section 7: Team & Settings */}
        <div className="pt-2 border-t border-slate-800/80 space-y-0.5">
          {navItem("/team", "Team", <Users className="w-4 h-4" />)}
          {navItem("/settings", "Settings", <Settings className="w-4 h-4" />)}
        </div>
      </div>

      {/* Internal Security Badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Internal Access Only</span>
          <span className="font-mono text-emerald-400">v1.5.0-ops</span>
        </div>
      </div>
    </aside>
  );
}
