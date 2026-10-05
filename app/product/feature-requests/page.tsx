"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Building2,
  Layers,
  ArrowRight,
  TrendingUp,
  X,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";
import { FeatureRequest, Priority } from "@/types";

export default function FeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>(opsStore.getFeatureRequests());
  const [showModal, setShowModal] = useState(false);

  const gyms = opsStore.getGyms();
  const modules = opsStore.getModules();
  const releases = opsStore.getReleases();

  const [formData, setFormData] = useState({
    gym_id: "gym_1",
    requested_by: "Arun Kumar (Owner)",
    title: "",
    description: "",
    business_problem: "",
    priority: "P1" as Priority,
    customers_count: 3,
    module_id: "mod_6",
    target_release_id: "rel_2",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const gym = gyms.find((g) => g.id === formData.gym_id);
    const mod = modules.find((m) => m.id === formData.module_id);
    const rel = releases.find((r) => r.id === formData.target_release_id);

    opsStore.createFeatureRequest({
      gym_id: gym?.id,
      gym_name: gym?.name,
      requested_by: formData.requested_by,
      title: formData.title,
      description: formData.description,
      business_problem: formData.business_problem,
      priority: formData.priority,
      customers_count: formData.customers_count,
      status: "IN_PLANNING",
      product_decision: `Approved for development in ${mod?.name || "Core"} module for ${rel?.version || "Next Release"}.`,
      module_id: mod?.id,
      module_name: mod?.name,
      target_release_id: rel?.id,
      target_release_name: rel?.version,
    });

    setRequests([...opsStore.getFeatureRequests()]);
    setShowModal(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Feature Requests & Gym Feedback"
        subtitle="Bridge from customer voice to engineering: Gym Request → Feature Request → Product Module → Sprint Task → Release."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            New Feature Request
          </button>
        }
      />

      {/* Feature Request Cards */}
      <div className="space-y-4">
        {requests.map((fr) => (
          <div
            key={fr.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            {/* Header with Code, Title, Priority, Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-amber-400 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  {fr.request_code}
                </span>
                <h3 className="text-base font-bold text-white">{fr.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={fr.priority} />
                <StatusBadge status={fr.status} />
              </div>
            </div>

            {/* Description & Business Problem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Customer Need & Description
                </span>
                <p className="text-slate-200 leading-relaxed">{fr.description}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Business Problem & Impact
                </span>
                <p className="text-slate-200 leading-relaxed">{fr.business_problem}</p>
              </div>
            </div>

            {/* The Critical SaaS Chain (Gym → Module → Release) */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Requested by: </span>
                <strong className="text-white">{fr.gym_name || "General Lead"}</strong>
                <span className="text-slate-500">({fr.requested_by})</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Impact: </span>
                <strong className="text-cyan-400">{fr.customers_count} gyms requesting</strong>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Target Module: </span>
                <strong className="text-purple-300">{fr.module_name || "Unassigned"}</strong>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Release: </span>
                <strong className="text-amber-400 font-mono">{fr.target_release_name || "v1.6.0"}</strong>
              </div>
            </div>

            {/* Decision note */}
            {fr.product_decision && (
              <div className="text-xs text-slate-400 italic">
                Product Decision: &ldquo;{fr.product_decision}&rdquo;
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Log Feature Request</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Originating Gym</label>
              <select
                value={formData.gym_id}
                onChange={(e) => setFormData({ ...formData, gym_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.area})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Feature Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Automated Biometric Turnstile Integration"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Feature Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Customer Business Problem *</label>
              <textarea
                required
                rows={2}
                value={formData.business_problem}
                onChange={(e) => setFormData({ ...formData, business_problem: e.target.value })}
                placeholder="What pain or revenue loss is the gym experiencing without this?"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Target Module</label>
                <select
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Target Release</label>
                <select
                  value={formData.target_release_id}
                  onChange={(e) => setFormData({ ...formData, target_release_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {releases.map((r) => (
                    <option key={r.id} value={r.id}>{r.version} ({r.name})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl">
                Submit Feature Request
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
