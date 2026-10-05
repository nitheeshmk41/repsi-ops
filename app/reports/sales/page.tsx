"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Building2,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  MapPin,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { opsStore } from "@/lib/services/ops-store";
import { formatCurrency } from "@/lib/utils";

export default function SalesReportPage() {
  const gyms = opsStore.getGyms();
  const visits = opsStore.getVisits();

  const totalLeads = gyms.length;
  const wonLeads = gyms.filter((g) => g.stage === "WON").length;
  const lostLeads = gyms.filter((g) => g.stage === "LOST").length;
  const inPipeline = gyms.filter((g) => g.stage !== "WON" && g.stage !== "LOST").length;

  const totalExpectedRevenue = gyms.reduce((acc, g) => acc + (g.expected_revenue || 0), 0);
  const convertedRevenue = gyms
    .filter((g) => g.stage === "WON")
    .reduce((acc, g) => acc + (g.expected_revenue || 0), 0);

  // Salesperson breakdown
  const salesReps = [
    {
      name: "Arun Sales (Salesperson A)",
      territory: "Peelamedu & Saravanampatti",
      leads: 3,
      visits: 2,
      demos: 2,
      won: 0,
      value: 126000,
    },
    {
      name: "Priya Sales (Salesperson B)",
      territory: "Race Course & Gandhipuram",
      leads: 2,
      visits: 1,
      demos: 1,
      won: 1,
      value: 132000,
    },
  ];

  const lostReasonsData = [
    { reason: "Price too high", count: 1, percent: 50 },
    { reason: "Already using software", count: 1, percent: 50 },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Sales & Field Performance Report"
        subtitle="Territory conversion rates, deal velocity, lost lead analysis, and salesperson pipeline."
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Pipeline Contract Value</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {formatCurrency(totalExpectedRevenue)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
            {formatCurrency(convertedRevenue)} Won Revenue
          </div>
        </div>

        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Win / Conversion Rate</div>
          <div className="text-2xl font-bold text-white mt-1">
            <AnimatedCounter value={Math.round((wonLeads / (totalLeads || 1)) * 100)} suffix="%" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {wonLeads} Converted • {inPipeline} Active
          </div>
        </div>

        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Field Visits Logged</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            <AnimatedCounter value={visits.length} />
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-semibold">
            100% On-ground Contact Rate
          </div>
        </div>

        <div className="card-subtle p-4 rounded-2xl">
          <div className="text-slate-400 text-xs font-medium">Average Deal Size</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {formatCurrency(totalExpectedRevenue / (totalLeads || 1))}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Annual SaaS Subscription</div>
        </div>
      </div>

      {/* Grid: Salesperson Breakdown & Lost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salesperson Table (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Field Performance by Sales Representative
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Salesperson</th>
                  <th className="px-4 py-3">Territory</th>
                  <th className="px-4 py-3">Gym Leads</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3">Won</th>
                  <th className="px-4 py-3 text-right">Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {salesReps.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-bold text-white">{r.name}</td>
                    <td className="px-4 py-3.5 text-slate-400">{r.territory}</td>
                    <td className="px-4 py-3.5 font-mono text-cyan-400 font-bold">{r.leads}</td>
                    <td className="px-4 py-3.5 font-mono">{r.visits}</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">{r.won}</td>
                    <td className="px-4 py-3.5 font-mono text-right text-emerald-400 font-bold">
                      {formatCurrency(r.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lost Reasons Breakdown (1 col) */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400" />
            Lost Reason Analysis
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Systematic tracking of why gym owners pass on adopting REPSI.
          </p>

          <div className="space-y-3 pt-2">
            {lostReasonsData.map((lr, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-300">{lr.reason}</span>
                  <span className="font-mono text-rose-400">{lr.count} leads</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${lr.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
