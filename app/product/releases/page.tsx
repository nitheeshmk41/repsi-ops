"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Layers,
  CheckSquare,
  Bug as BugIcon,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { formatDate } from "@/lib/utils";

export default function ReleasesPage() {
  const releases = opsStore.getReleases();
  const modules = opsStore.getModules();
  const tasks = opsStore.getTasks();
  const bugs = opsStore.getBugs();

  return (
    <AppLayout>
      <PageHeader
        title="Product Releases & Deployments"
        subtitle="Coordinate release candidates, QA verification readiness, and milestone deliverables."
      />

      <div className="space-y-6">
        {releases.map((rel) => {
          const relModules = modules.filter((m) => m.release_name === rel.version || m.release_id === rel.id);
          const relTasks = tasks.filter((t) => t.module_id === "mod_1" || t.module_id === "mod_3");
          const relBugs = bugs.filter((b) => b.app_version.includes(rel.version) || rel.version === "v1.5.0");

          return (
            <div
              key={rel.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      {rel.version}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">{rel.name}</h3>
                    <StatusBadge status={rel.status} size="md" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
                    {rel.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs">
                    <span className="text-slate-500 block">Target Release Date</span>
                    <span className="font-mono font-bold text-white">{formatDate(rel.release_date)}</span>
                  </div>
                  <Link
                    href={`/product/releases/${rel.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    Release Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Release Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Shipped Modules</span>
                    <Layers className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5 font-mono">
                    {rel.modules_count || 4}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Target Features</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5 font-mono">
                    {rel.features_count || 12}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Sprint Tasks</span>
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5 font-mono">
                    {rel.tasks_count || 18}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Bugs In Scope</span>
                    <BugIcon className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5 font-mono">
                    {rel.bugs_count || 3}
                  </div>
                </div>
              </div>

              {/* Included Modules Pill List */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-2">
                <span className="text-slate-400 font-semibold">Included in this Release:</span>
                {relModules.map((m) => (
                  <span
                    key={m.id}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
                  >
                    {m.name} ({m.progress_percent}%)
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
