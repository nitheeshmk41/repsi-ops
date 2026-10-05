"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { useAuth } from "@/lib/auth/context";

export default function MyWorkPage() {
  const { user } = useAuth();
  const tasks = opsStore.getTasks();

  // Categorize tasks for today, overdue, upcoming
  const todayTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW" || t.id === "task_1" || t.id === "task_2" || t.id === "task_3"
  );
  const overdueTasks = tasks.filter(
    (t) => t.status === "BLOCKED" || (t.due_date && new Date(t.due_date) < new Date("2026-10-05"))
  );
  const upcomingTasks = tasks.filter(
    (t) => t.status === "TODO" && !overdueTasks.some((ot) => ot.id === t.id)
  );

  return (
    <AppLayout>
      <PageHeader
        title="My Work"
        subtitle={`Personal daily operational focus for ${user?.name || "Developer"} • Today, Overdue, and Upcoming deadlines`}
      />

      <div className="space-y-8">
        {/* Section 1: OVERDUE (Critical attention) */}
        {overdueTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <span>OVERDUE ({overdueTasks.length})</span>
            </div>

            <div className="space-y-3">
              {overdueTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/60 shadow-lg flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{t.title}</span>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-rose-200/80 mt-1">{t.description}</p>
                    {t.blocker_reason && (
                      <p className="text-xs text-rose-400 font-semibold mt-1">
                        Blocker: {t.blocker_reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      Due: {t.due_date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: TODAY */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Clock className="w-4 h-4" />
            <span>TODAY&apos;S FOCUS ({todayTasks.length})</span>
          </div>

          <div className="space-y-3">
            {todayTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 shadow-md flex items-center justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{t.title}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                    <span>Module: <strong className="text-slate-300">{t.module_name}</strong></span>
                    <span>•</span>
                    <span>Effort: <strong className="text-cyan-400">{t.actual_hours || 0}h / {t.estimated_hours || 0}h</strong></span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    Target: Today
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: UPCOMING */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Calendar className="w-4 h-4" />
            <span>UPCOMING SPRINT WORK ({upcomingTasks.length})</span>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{t.title}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-slate-400">
                    Due: {t.due_date || "Next Sprint"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
