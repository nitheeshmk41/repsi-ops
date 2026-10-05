"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { Blocker } from "@/types";

export default function BlockersPage() {
  const [blockers, setBlockers] = useState<Blocker[]>(opsStore.getBlockers());
  const [showModal, setShowModal] = useState(false);

  const tasks = opsStore.getTasks();
  const users = opsStore.getUsers();

  const handleResolve = (id: string) => {
    opsStore.resolveBlocker(id);
    setBlockers([...opsStore.getBlockers()]);
  };

  const activeBlockers = blockers.filter((b) => b.status === "ACTIVE");
  const resolvedBlockers = blockers.filter((b) => b.status === "RESOLVED");

  return (
    <AppLayout>
      <PageHeader
        title="Blockers & Impediments"
        subtitle="Dedicated resolution system for stalled engineering tasks, external dependency bottlenecks, and API approvals."
      />

      {/* Summary Alert */}
      {activeBlockers.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {activeBlockers.length} Active Blocker{activeBlockers.length > 1 ? "s" : ""} Requiring Unblocking
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Ensure responsible owners address impediments before sprint deadline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Blockers */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">
          Active Blockers ({activeBlockers.length})
        </h2>

        {activeBlockers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/40 border border-slate-800 rounded-3xl">
            No active blockers! All engineering paths are clear.
          </div>
        ) : (
          activeBlockers.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-rose-900/40 shadow-xl space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      CRITICAL IMPEDIMENT
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Blocked since {b.blocked_since}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{b.task_title}</h3>
                </div>

                <button
                  onClick={() => handleResolve(b.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all shrink-0"
                >
                  Mark Blocker Resolved
                </button>
              </div>

              {/* Blocker Reason and Dependency */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 font-medium">Impediment Reason: </span>
                  <span className="text-slate-200 font-semibold">{b.blocker_reason}</span>
                </div>
                {b.dependency_desc && (
                  <div>
                    <span className="text-slate-400 font-medium">External Dependency: </span>
                    <span className="text-cyan-400 font-mono">{b.dependency_desc}</span>
                  </div>
                )}
              </div>

              {/* People responsible */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div>
                  Blocked Person: <strong className="text-slate-200">{b.person_name}</strong>
                </div>
                <div>
                  Owner Responsible for Unblocking:{" "}
                  <strong className="text-amber-400">{b.owner_responsible_name}</strong>
                </div>
                <div>
                  Expected Resolution:{" "}
                  <span className="font-mono text-slate-300 font-semibold">
                    {b.expected_resolution_date || "Immediate"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolved Blockers */}
      {resolvedBlockers.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resolved Blockers History ({resolvedBlockers.length})
          </h2>
          <div className="space-y-2">
            {resolvedBlockers.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-300">{b.task_title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{b.blocker_reason}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                  RESOLVED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
