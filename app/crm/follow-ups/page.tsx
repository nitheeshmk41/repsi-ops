"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Phone,
  MessageSquare,
  Calendar,
  Mail,
  CheckCircle2,
  Plus,
  Building2,
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { FollowUp } from "@/types";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(opsStore.getFollowUps());
  const [filterType, setFilterType] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    gym_id: "gym_1",
    contact_name: "",
    due_date: new Date().toISOString().split("T")[0],
    type: "WHATSAPP" as const,
    notes: "",
  });

  const gyms = opsStore.getGyms();

  const filtered = followUps.filter((f) => {
    if (filterType === "ALL") return true;
    return f.type === filterType;
  });

  const handleComplete = (id: string) => {
    opsStore.completeFollowUp(id);
    setFollowUps([...opsStore.getFollowUps()]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const gym = gyms.find((g) => g.id === formData.gym_id);
    if (!gym) return;

    opsStore.createFollowUp({
      gym_id: gym.id,
      gym_name: gym.name,
      contact_name: formData.contact_name || gym.owner_name,
      due_date: formData.due_date,
      assigned_to_id: "usr_sales_1",
      assigned_to_name: "Arun Sales (Salesperson A)",
      type: formData.type,
      status: "PENDING",
      notes: formData.notes,
    });

    setFollowUps([...opsStore.getFollowUps()]);
    setShowModal(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Follow-ups Tracker"
        subtitle="Manage upcoming calls, WhatsApp communications, and demo check-ins."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Follow-up
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 text-xs">
        {["ALL", "WHATSAPP", "CALL", "VISIT", "DEMO", "EMAIL"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterType === t
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                {item.type === "WHATSAPP" && <MessageSquare className="w-5 h-5" />}
                {item.type === "CALL" && <Phone className="w-5 h-5" />}
                {item.type === "VISIT" && <Calendar className="w-5 h-5" />}
                {item.type === "DEMO" && <Clock className="w-5 h-5" />}
                {item.type === "EMAIL" && <Mail className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/crm/gyms/${item.gym_id}`}
                    className="font-bold text-sm text-white hover:text-emerald-400 transition-colors"
                  >
                    {item.gym_name}
                  </Link>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-slate-300 mt-1">{item.notes}</p>
                <div className="text-[11px] text-slate-500 mt-1">
                  Due: <span className="font-semibold text-slate-300">{item.due_date}</span> • Assigned to: {item.assigned_to_name}
                </div>
              </div>
            </div>

            {item.status === "PENDING" && (
              <button
                onClick={() => handleComplete(item.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700 transition-all shrink-0"
              >
                Mark Completed
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Next Follow-up</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Gym</label>
              <select
                value={formData.gym_id}
                onChange={(e) => setFormData({ ...formData, gym_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Follow-up Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="CALL">Phone Call</option>
                  <option value="VISIT">In-person Visit</option>
                  <option value="DEMO">Product Demo</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Due Date</label>
                <input
                  required
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Action Notes</label>
              <textarea
                required
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="What needs to be followed up?"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl">
                Save Follow-up
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
