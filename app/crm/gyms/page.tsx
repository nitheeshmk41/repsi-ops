"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  Filter,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  CalendarPlus,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { opsStore } from "@/lib/services/ops-store";
import { Gym, BusinessType, PipelineStage } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>(opsStore.getGyms());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStage, setFilterStage] = useState<string>("ALL");

  const filteredGyms = gyms.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      g.area.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "ALL" || g.business_type === filterType;
    const matchesStage = filterStage === "ALL" || g.stage === filterStage;

    return matchesSearch && matchesType && matchesStage;
  });

  return (
    <AppLayout>
      <PageHeader
        title="Fitness Gyms & Accounts"
        subtitle="Manage all active fitness accounts, onboarding health, gyms database, and location directories."
        actions={
          <Link
            href="/crm/leads"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Gym Lead
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gym, owner, city or area..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Business Types</option>
            <option value="Gym">Traditional Gym</option>
            <option value="CrossFit">CrossFit Box</option>
            <option value="MMA">MMA Academy</option>
            <option value="Yoga Studio">Yoga Studio</option>
            <option value="Pilates">Pilates Studio</option>
          </select>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Stages</option>
            <option value="WON">Signed / Won</option>
            <option value="TRIAL">Active Trial</option>
            <option value="DEMO_DONE">Demo Done</option>
            <option value="PROSPECT">Prospect</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Gyms Table or Cards */}
      {filteredGyms.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-10 h-10 text-slate-500" />}
          title="No Gyms Found"
          description="There are currently no gym accounts matching your search or filters. You can create a new lead to start managing gym records."
          actionLabel="Create First Gym Lead"
          onAction={() => (window.location.href = "/crm/leads")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGyms.map((g) => (
            <div
              key={g.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {g.business_type}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{g.name}</h3>
                  </div>
                  <StatusBadge status={g.stage} />
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300 font-medium">{g.owner_name}</span>
                    <span>•</span>
                    <span>{g.members_count} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{g.area}, {g.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <a href={`tel:${g.phone}`} className="text-emerald-400 hover:underline">
                      {g.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Target Value</span>
                  <div className="font-semibold text-white">
                    {formatCurrency(g.expected_revenue || 0)}
                  </div>
                </div>
                <Link
                  href={`/crm/leads/${g.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
