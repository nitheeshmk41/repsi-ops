"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  Layers,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { Priority } from "@/types";

export default function RoadmapPage() {
  const requests = opsStore.getFeatureRequests();
  const modules = opsStore.getModules();

  // Categorize roadmap items
  const nowItems = [
    {
      id: "rd_1",
      title: "Dynamic QR Desk Scanner & Member Mobile Pass",
      description: "Fast zero-contact check-in validation directly from gym receptionist iPad.",
      module: "Attendance",
      priority: "P0" as const,
      customers_count: 14,
      target_release: "v1.5.0",
      status: "IN_DEVELOPMENT",
    },
    {
      id: "rd_2",
      title: "Razorpay Webhook & UPI Autopay Engine",
      description: "Auto-reconcile membership renewal subscription payments with zero missed entries.",
      module: "Payments",
      priority: "P0" as const,
      customers_count: 11,
      target_release: "v1.5.0",
      status: "QA",
    },
  ];

  const nextItems = [
    {
      id: "rd_3",
      title: "WhatsApp Automatic Renewal Reminders (FR-102)",
      description: "Direct WhatsApp notifications 7 days, 3 days, and on expiry with 1-click renewal UPI link.",
      module: "Notifications",
      priority: "P1" as const,
      customers_count: 8,
      target_release: "v1.6.0",
      status: "IN_PLANNING",
    },
    {
      id: "rd_4",
      title: "Multi-branch Consolidated Reporting",
      description: "Centralized owner dashboard showing footfall and cash receipts across all branches.",
      module: "Reports",
      priority: "P2" as const,
      customers_count: 6,
      target_release: "v1.6.0",
      status: "PLANNED",
    },
  ];

  const laterItems = [
    {
      id: "rd_5",
      title: "Trainer Commission Matrix based on PT Renewals (FR-103)",
      description: "Variable commission percentages based on trainer tier and client package retention.",
      module: "Trainer",
      priority: "P2" as const,
      customers_count: 5,
      target_release: "v2.0.0",
      status: "PROPOSED",
    },
    {
      id: "rd_6",
      title: "AI Workout & Diet Plan Generator",
      description: "LLM-assisted customized workout routines based on gym member goals.",
      module: "Trainer",
      priority: "P3" as const,
      customers_count: 4,
      target_release: "v2.0.0",
      status: "PROPOSED",
    },
  ];

  interface RoadmapCardItem {
    id: string;
    title: string;
    description: string;
    module: string;
    priority: Priority;
    customers_count: number;
    target_release: string;
    status: string;
  }

  const renderColumn = (title: string, subtitle: string, items: RoadmapCardItem[], badgeColor: string) => (
    <div className="flex-1 bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
            {title}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {items.length}
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 space-y-3 shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-xs text-white leading-snug">{item.title}</h4>
              <PriorityBadge priority={item.priority} />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Layers className="w-3 h-3" />
                <span>{item.module}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Users className="w-3 h-3 text-slate-500" />
                <span>{item.customers_count} Gyms</span>
              </div>
              <span className="font-mono text-amber-400 font-semibold">{item.target_release}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Product Roadmap"
        subtitle="Strategic product direction mapped into Now, Next, and Later horizons based on customer demand."
        actions={
          <Link
            href="/product/feature-requests"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Customer Feature Requests
          </Link>
        }
      />

      {/* 3-Column Roadmap Horizon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn("NOW (Current Release)", "In active development & QA verification", nowItems, "text-emerald-400")}
        {renderColumn("NEXT (Upcoming Cycle)", "Committed for next sprint release", nextItems, "text-cyan-400")}
        {renderColumn("LATER (Future Horizon)", "Validated customer demand in discovery", laterItems, "text-amber-400")}
      </div>
    </AppLayout>
  );
}
