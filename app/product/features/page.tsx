"use client";

import React from "react";
import Link from "next/link";
import { CheckSquare, Sparkles, Layers, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";

export default function FeaturesPage() {
  const features = opsStore.getFeatures();

  return (
    <AppLayout>
      <PageHeader
        title="Product Features Catalog"
        subtitle="Granular capabilities organized under parent modules and tied to customer demand."
        actions={
          <Link
            href="/product/modules"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            <Layers className="w-4 h-4" />
            View Modules
          </Link>
        }
      />

      <div className="space-y-4">
        {features.map((f) => (
          <div
            key={f.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-sm text-white">{f.name}</span>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {f.module_name || "Attendance"}
                </span>
                <PriorityBadge priority={f.priority} />
                <StatusBadge status={f.status} />
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{f.description}</p>
            </div>

            <div className="text-right text-xs shrink-0">
              <span className="text-slate-400 font-mono font-semibold">
                {f.requested_by_count || 1} Gyms Requested
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
