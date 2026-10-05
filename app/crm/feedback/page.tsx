"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Sparkles, Building2, Plus, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { opsStore } from "@/lib/services/ops-store";

export default function FeedbackPage() {
  const gyms = opsStore.getGyms();
  const feedbackList = [
    {
      id: "fb_1",
      gym_name: "ABC Fitness",
      gym_id: "gym_1",
      author: "Arun Kumar (Owner)",
      rating: "High Impact",
      content:
        "The QR code scanner is super fast during peak hours (6 AM to 8 AM). However, receptionists urgently need automatic WhatsApp renewal reminders so they don't have to manually type messages.",
      converted_to: "FR-102 (WhatsApp Renewal Automation)",
      status: "CONVERTED_TO_FEATURE",
    },
    {
      id: "fb_2",
      gym_name: "FitZone Studio",
      gym_id: "gym_2",
      author: "Kavitha Ramesh",
      rating: "Positive",
      content:
        "Cross-studio membership check-in works smoothly between our Race Course and Peelamedu locations. Need unified GST tax invoice exports for our monthly CA auditing.",
      converted_to: "FR-104 (GST Invoice Exporter)",
      status: "IN_REVIEW",
    },
    {
      id: "fb_3",
      gym_name: "PowerHouse Gym",
      gym_id: "gym_3",
      author: "Manoj Singh",
      rating: "Constructive",
      content:
        "Trainers love client progression charts. But we need custom trainer commission payout calculation so month-end payroll doesn't require Excel formulas.",
      converted_to: "FR-103 (Trainer Commission Matrix)",
      status: "CONVERTED_TO_FEATURE",
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Customer Feedback & Intelligence"
        subtitle="Unfiltered feedback from gym owners and front-desk managers, feeding directly into product decisions."
        actions={
          <Link
            href="/product/feature-requests"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            View Feature Requests
          </Link>
        }
      />

      <div className="space-y-4">
        {feedbackList.map((fb) => (
          <div
            key={fb.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <Link
                  href={`/crm/gyms/${fb.gym_id}`}
                  className="font-bold text-sm text-white hover:text-emerald-400 transition-colors"
                >
                  {fb.gym_name}
                </Link>
                <span className="text-xs text-slate-400">• {fb.author}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {fb.rating}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed italic">
              &ldquo;{fb.content}&rdquo;
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 text-cyan-400 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Action Taken: {fb.converted_to}</span>
              </div>
              <Link
                href="/product/feature-requests"
                className="text-emerald-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
              >
                Track in Roadmap <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
