"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Bug as BugIcon, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge, SeverityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";

export default function CriticalBugsPage() {
  const criticalBugs = opsStore.getBugs().filter((b) => b.severity === "CRITICAL" || b.priority === "P0");

  return (
    <AppLayout>
      <PageHeader
        title="Critical & P0 Bugs"
        subtitle="Zero-tolerance critical defects requiring immediate hotfix or blocking customer operations."
      />

      <div className="space-y-4">
        {criticalBugs.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-3xl bg-rose-950/20 border border-rose-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-extrabold text-rose-400">{b.bug_id}</span>
                <Link href={`/bugs/${b.id}`} className="font-bold text-base text-white hover:text-rose-300">
                  {b.title}
                </Link>
                <SeverityBadge severity={b.severity} />
                <PriorityBadge priority={b.priority} />
              </div>
              <p className="text-xs text-rose-200/80 mt-1 max-w-3xl">{b.description}</p>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                <span>Module: <strong className="text-white">{b.module_name}</strong></span>
                <span>•</span>
                <span>Assignee: <strong className="text-slate-300">{b.assigned_to_name}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={b.status} />
              <Link
                href={`/bugs/${b.id}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-md shadow-rose-500/20"
              >
                Triage Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
