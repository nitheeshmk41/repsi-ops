"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Layers,
  CheckSquare,
  Bug as BugIcon,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge, SeverityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";
import { formatDate } from "@/lib/utils";

export default function ReleaseDetailPage() {
  const params = useParams();
  const relId = params.id as string;
  const release = opsStore.getReleaseById(relId) || opsStore.getReleases()[0];

  const modules = opsStore.getModules();
  const tasks = opsStore.getTasks();
  const bugs = opsStore.getBugs();

  return (
    <AppLayout>
      <Link
        href="/product/releases"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Releases
      </Link>

      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-emerald-400 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                {release.version}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">{release.name}</h1>
              <StatusBadge status={release.status} size="md" />
            </div>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {release.description}
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-500 block">Target Deployment</span>
            <span className="font-mono font-bold text-white text-sm">{formatDate(release.release_date)}</span>
          </div>
        </div>

        {/* Readiness Bar */}
        <div className="pt-4 border-t border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Release Verification Readiness</span>
            <span className="font-bold text-emerald-400 font-mono">85% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[85%]" />
          </div>
        </div>
      </div>

      {/* Grid: Connected Modules & Tasks & Bugs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Included Modules & Tasks */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Modules & Deliverables in {release.version}
          </h3>

          <div className="space-y-3">
            {modules.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{m.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({m.code})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Lead: {m.owner_name} • {m.progress_percent}% Progress
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bugs Required for Signoff */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BugIcon className="w-4 h-4 text-rose-400" />
            Bugs in Scope for Release Signoff
          </h3>

          <div className="space-y-3">
            {bugs.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-400">{b.bug_id}</span>
                    <span className="font-semibold text-white">{b.title}</span>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={b.severity} />
                  <PriorityBadge priority={b.priority} />
                  <span className="text-slate-500">• Module: {b.module_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
