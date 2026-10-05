"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FlaskConical, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SeverityBadge, PriorityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";
import { Bug } from "@/types";

export default function QATestingPage() {
  const [bugs, setBugs] = useState<Bug[]>(opsStore.getBugs());

  const handleStatusChange = (bugId: string, status: any) => {
    opsStore.updateBugStatus(bugId, status);
    setBugs([...opsStore.getBugs()]);
  };

  return (
    <AppLayout>
      <PageHeader
        title="QA Verification & Testing Suite"
        subtitle="Validate reported defect resolutions on staging environment before closing or reopening tickets."
      />

      <div className="space-y-4">
        {bugs.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-rose-400">{b.bug_id}</span>
                <Link href={`/bugs/${b.id}`} className="font-bold text-sm text-white hover:text-purple-300">
                  {b.title}
                </Link>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{b.description}</p>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                <span>Module: <strong className="text-white">{b.module_name}</strong></span>
                <span>•</span>
                <span>QA Owner: <strong className="text-purple-300">{b.qa_owner_name}</strong></span>
                <span>•</span>
                <span>Environment: <strong className="text-slate-300">{b.environment}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleStatusChange(b.id, "CLOSED")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pass & Close
              </button>
              <button
                onClick={() => handleStatusChange(b.id, "REOPENED")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Fail & Reopen
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
