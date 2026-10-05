"use client";

import React from "react";
import Link from "next/link";
import { Bug as BugIcon, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge, SeverityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";

export default function MyBugsPage() {
  const bugs = opsStore.getBugs();

  return (
    <AppLayout>
      <PageHeader
        title="My Assigned Bugs"
        subtitle="Bugs currently assigned to your engineering queue for fix and verification."
      />

      <div className="space-y-4">
        {bugs.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-rose-400">{b.bug_id}</span>
                <Link href={`/bugs/${b.id}`} className="font-bold text-sm text-white hover:text-rose-300">
                  {b.title}
                </Link>
                <SeverityBadge severity={b.severity} />
                <PriorityBadge priority={b.priority} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{b.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={b.status} />
              <Link
                href={`/bugs/${b.id}`}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Inspect
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
