"use client";

import React from "react";
import {
  Layers,
  Bug as BugIcon,
  CheckSquare,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { opsStore } from "@/lib/services/ops-store";

export default function ProductReportPage() {
  const modules = opsStore.getModules();
  const tasks = opsStore.getTasks();
  const bugs = opsStore.getBugs();

  return (
    <AppLayout>
      <PageHeader
        title="Product & Engineering Health Report"
        subtitle="Architecture velocity, defect resolution time, release stability, and module completion."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Average Module Progress</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {Math.round(modules.reduce((a, m) => a + m.progress_percent, 0) / (modules.length || 1))}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
            Sprint velocity on schedule
          </div>
        </div>

        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Sprint Completion Rate</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {Math.round(
              (tasks.filter((t) => t.status === "DONE").length / (tasks.length || 1)) * 100
            )}%
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">
            {tasks.filter((t) => t.status === "DONE").length} of {tasks.length} tasks closed
          </div>
        </div>

        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Critical Defect Density</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">
            {bugs.filter((b) => b.severity === "CRITICAL").length} Critical
          </div>
          <div className="text-[11px] text-slate-400 mt-1">P0 triage active</div>
        </div>

        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">QA Reopen Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            0%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">High staging test stability</div>
        </div>
      </div>

      {/* Module Velocity Progress */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Module Implementation Breakdown
        </h3>

        <div className="space-y-4 pt-2">
          {modules.map((m) => (
            <div key={m.id} className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-white">
                  {m.name} ({m.code}) - Lead: {m.owner_name}
                </span>
                <span className="font-mono font-bold text-emerald-400">{m.progress_percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${m.progress_percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
