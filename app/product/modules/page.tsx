"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  CheckSquare,
  Bug,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  UserCheck,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";
import { RepsiModule } from "@/types";

export default function ModulesPage() {
  const modules = opsStore.getModules();

  return (
    <AppLayout>
      <PageHeader
        title="Product Modules & Architecture"
        subtitle="Manage core functional modules, development progress, and engineering ownership."
        actions={
          <Link
            href="/product/feature-requests"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Feature Requests
          </Link>
        }
      />

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 shadow-xl flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Header with Code and Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  {m.code}
                </span>
                <StatusBadge status={m.status} />
              </div>

              {/* Title and Description */}
              <div className="mt-3">
                <Link
                  href={`/product/modules/${m.id}`}
                  className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors"
                >
                  {m.name}
                </Link>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Module Completion</span>
                  <span className="font-mono font-bold text-white">{m.progress_percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${m.progress_percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer with Owner, Bugs, and Release */}
            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="text-slate-400">
                <span>Owner: </span>
                <strong className="text-slate-200">{m.owner_name}</strong>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-mono text-[11px] font-semibold">
                  {m.release_name || "v1.5.0"}
                </span>
                <Link
                  href={`/product/modules/${m.id}`}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
