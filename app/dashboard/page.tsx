"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Building2,
  CalendarCheck,
  Layers,
  Bug,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge, SeverityBadge } from "@/components/shared/PriorityBadge";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { useAuth } from "@/lib/auth/context";
import { opsStore } from "@/lib/services/ops-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { role, user } = useAuth();

  const gyms = opsStore.getGyms();
  const visits = opsStore.getTodayVisits();
  const followUps = opsStore.getFollowUps();
  const modules = opsStore.getModules();
  const tasks = opsStore.getTasks();
  const bugs = opsStore.getBugs();
  const blockers = opsStore.getBlockers().filter((b) => b.status === "ACTIVE");
  const activities = opsStore.getActivities().slice(0, 6);
  const team = opsStore.getUsers();

  // Metrics calculations
  const totalLeads = gyms.length;
  const convertedCustomers = gyms.filter((g) => g.stage === "WON").length;
  const lostLeads = gyms.filter((g) => g.stage === "LOST").length;
  const trialsCount = gyms.filter((g) => g.stage === "TRIAL").length;
  const demosCount = gyms.filter((g) => g.stage === "DEMO_COMPLETED" || g.stage === "DEMO_SCHEDULED").length;
  
  const expectedRevenue = gyms.reduce((acc, g) => acc + (g.expected_revenue || 0), 0);
  const convertedRevenue = gyms
    .filter((g) => g.stage === "WON")
    .reduce((acc, g) => acc + (g.expected_revenue || 0), 0);

  const completedModules = modules.filter((m) => m.status === "COMPLETED").length;
  const devModules = modules.filter((m) => m.status === "DEVELOPMENT").length;
  const openTasks = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length;
  const criticalBugs = bugs.filter((b) => b.severity === "CRITICAL" && b.status !== "CLOSED").length;
  const totalBugs = bugs.filter((b) => b.status !== "CLOSED").length;

  return (
    <AppLayout>
      {/* Page Header */}
      <PageHeader
        title={`Repsi Operations Hub`}
        subtitle={`Real-time overview for ${user?.name || "Team Member"} (${role.replace("_", " ")}) • What is happening in REPSI today?`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/crm/leads"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Lead
            </Link>
            <Link
              href="/sales/today"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
              Today&apos;s Visits ({visits.length})
            </Link>
          </div>
        }
      />

      {/* Critical Blocker Alert Banner */}
      {blockers.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-800/60 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{blockers.length} Active Blocker{blockers.length > 1 ? "s" : ""} Requiring Attention</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                  High Priority
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                {blockers[0].person_name}: {blockers[0].blocker_reason}
              </p>
            </div>
          </div>
          <Link
            href="/project/blockers"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors"
          >
            Resolve Blocker
          </Link>
        </div>
      )}

      {/* Section 1: Sales & Revenue KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Sales & Field Operations KPIs
          </h2>
          <Link href="/crm/pipeline" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
            View Pipeline <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Leads */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Total Gym Leads</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              <AnimatedCounter value={totalLeads} />
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>{trialsCount} currently in active trial</span>
            </div>
          </div>

          {/* Card 2: Expected Revenue */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Pipeline Value</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              {formatCurrency(expectedRevenue)}
            </div>
            <div className="text-[11px] text-cyan-400 mt-1">
              {formatCurrency(convertedRevenue)} converted
            </div>
          </div>

          {/* Card 3: Visits Today */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Field Visits Today</span>
              <CalendarCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              <AnimatedCounter value={visits.length} />
            </div>
            <div className="text-[11px] text-amber-300 mt-1">
              {followUps.filter((f) => f.status === "PENDING").length} follow-ups scheduled
            </div>
          </div>

          {/* Card 4: Won vs Lost */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Conversion Win Rate</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              <AnimatedCounter value={Math.round((convertedCustomers / (totalLeads || 1)) * 100)} suffix="%" />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {convertedCustomers} Won • {lostLeads} Lost
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Product & Engineering KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Product & Engineering Health
          </h2>
          <Link href="/product/modules" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
            All Modules <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Modules */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Core Modules</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              <AnimatedCounter value={modules.length} />
            </div>
            <div className="text-[11px] text-purple-300 mt-1">
              {completedModules} Completed • {devModules} In Dev
            </div>
          </div>

          {/* Card 2: Open Tasks */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Active Tasks</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              <AnimatedCounter value={openTasks} />
            </div>
            <div className="text-[11px] text-rose-400 mt-1">
              1 task overdue (Attendance API)
            </div>
          </div>

          {/* Card 3: Bugs */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Open Bugs</span>
              <Bug className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              <AnimatedCounter value={totalBugs} />
            </div>
            <div className="text-[11px] text-rose-400 mt-1 font-semibold">
              {criticalBugs} Critical (P0) Bug
            </div>
          </div>

          {/* Card 4: Target Release */}
          <div className="card-subtle p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Target Release</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white mt-2 font-mono">
              v1.5.0
            </div>
            <div className="text-[11px] text-amber-300 mt-1">
              QA Verification Phase
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Today's Schedule & Gym Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Visits & Due Follow-ups (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Today&apos;s Field Schedule & Visits</h3>
              </div>
              <Link href="/sales/today" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                Open Schedule &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80">
              {visits.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
                      {v.time_slot}
                    </div>
                    <div>
                      <Link href={`/crm/gyms/${v.gym_id}`} className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                        {v.gym_name}
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Owner: {v.owner_name} • {v.gym_area} • Assigned: {v.salesperson_name.split(" ")[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={v.status} />
                    <Link
                      href={`/crm/gyms/${v.gym_id}`}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="View Gym Details"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Bugs & Tasks Under Review */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">High Priority Bugs & Deadlines</h3>
              </div>
              <Link href="/bugs/all" className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                All Bugs &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80">
              {bugs.slice(0, 3).map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400">{b.bug_id}</span>
                      <Link href={`/bugs/${b.id}`} className="text-xs font-semibold text-white hover:text-rose-300">
                        {b.title}
                      </Link>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Module: {b.module_name}</span>
                      <span>•</span>
                      <span>Assignee: {b.assigned_to_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={b.severity} />
                    <PriorityBadge priority={b.priority} />
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Timeline & Team Workload */}
        <div className="space-y-6">
          {/* Company Activity Timeline */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Live Company Activity
            </h3>
            <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {activities.map((act) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                  <div className="text-xs font-semibold text-slate-200">
                    {act.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {act.description}
                  </p>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>{act.user_name}</span>
                    <span>•</span>
                    <span>{formatDate(act.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Workload Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Team Operations
              </h3>
              <Link href="/team" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                View All &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {team.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.department}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">{m.active_tasks_count || 0}</span>
                    <span className="text-slate-500 ml-1">tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
