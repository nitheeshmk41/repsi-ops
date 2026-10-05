"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  ArrowLeft,
  CheckSquare,
  Bug as BugIcon,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  UserCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge, SeverityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params.id as string;
  const moduleItem = opsStore.getModuleById(moduleId);

  const [activeTab, setActiveTab] = useState<"features" | "tasks" | "bugs">("features");

  if (!moduleItem) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-white">Module Not Found</h2>
          <Link href="/product/modules" className="text-emerald-400 text-xs underline mt-2 inline-block">
            Back to Modules
          </Link>
        </div>
      </AppLayout>
    );
  }

  const features = opsStore.getFeatures(moduleItem.id);
  const tasks = opsStore.getTasks().filter((t) => t.module_id === moduleItem.id);
  const bugs = opsStore.getBugs().filter((b) => b.module_id === moduleItem.id);

  return (
    <AppLayout>
      <Link
        href="/product/modules"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Modules
      </Link>

      {/* Module Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{moduleItem.name}</h1>
              <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                {moduleItem.code}
              </span>
              <StatusBadge status={moduleItem.status} />
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">{moduleItem.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div>
              <span className="text-slate-500">Lead: </span>
              <strong>{moduleItem.owner_name}</strong>
            </div>
            <div>
              <span className="text-slate-500">Target: </span>
              <strong className="text-amber-400 font-mono">{moduleItem.release_name || "v1.5.0"}</strong>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Implementation Readiness</span>
            <span className="font-bold text-emerald-400 font-mono">{moduleItem.progress_percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: `${moduleItem.progress_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("features")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "features" ? "border-emerald-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Features ({features.length})
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "tasks" ? "border-emerald-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Engineering Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab("bugs")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "bugs" ? "border-emerald-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Linked Bugs ({bugs.length})
        </button>
      </div>

      {/* Features Tab */}
      {activeTab === "features" && (
        <div className="space-y-3">
          {features.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No features registered in this module yet.</p>
          ) : (
            features.map((feat) => (
              <div
                key={feat.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{feat.name}</span>
                    <PriorityBadge priority={feat.priority} />
                    <StatusBadge status={feat.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{feat.description}</p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {feat.requested_by_count || 1} gym requests
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-xs">{task.title}</span>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                <div className="text-[11px] text-slate-500 mt-1">
                  Assignee: {task.assignee_name} • Due: {task.due_date}
                </div>
              </div>
              <div className="text-xs font-mono text-cyan-400 font-bold">
                {task.actual_hours || 0}h / {task.estimated_hours || 0}h
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bugs Tab */}
      {activeTab === "bugs" && (
        <div className="space-y-3">
          {bugs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No open bugs for this module.</p>
          ) : (
            bugs.map((bug) => (
              <div
                key={bug.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400">{bug.bug_id}</span>
                    <Link href={`/bugs/${bug.id}`} className="font-semibold text-white text-xs hover:text-rose-300">
                      {bug.title}
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{bug.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={bug.severity} />
                  <StatusBadge status={bug.status} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AppLayout>
  );
}
