"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Kanban,
  Building2,
  DollarSign,
  ArrowRight,
  Plus,
  Filter,
  MoveRight,
  GripVertical,
  Search,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { opsStore } from "@/lib/services/ops-store";
import { Gym, PipelineStage, LostReason } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function PipelinePage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [draggedGymId, setDraggedGymId] = useState<string | null>(null);
  const [activeDropStage, setActiveDropStage] = useState<PipelineStage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRep, setSelectedRep] = useState("ALL");

  useEffect(() => {
    opsStore.ensureHydrated();
    setGyms([...opsStore.getGyms()]);
    const unsubscribe = opsStore.subscribe(() => {
      setGyms([...opsStore.getGyms()]);
    });
    return unsubscribe;
  }, []);

  // Lost modal state if dropped into LOST
  const [showLostModal, setShowLostModal] = useState(false);
  const [pendingLostGymId, setPendingLostGymId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState<LostReason>("Price too high");
  const [lostNotes, setLostNotes] = useState("");

  const stages: { stage: PipelineStage; title: string; color: string; badgeBg: string }[] = [
    { stage: "PROSPECT", title: "Prospect", color: "border-slate-700 bg-slate-900/40 text-slate-300", badgeBg: "bg-slate-800 text-slate-300" },
    { stage: "CONTACTED", title: "Contacted", color: "border-sky-800 bg-sky-950/20 text-sky-300", badgeBg: "bg-sky-500/20 text-sky-300" },
    { stage: "VISIT_PLANNED", title: "Visit Planned", color: "border-amber-800 bg-amber-950/20 text-amber-300", badgeBg: "bg-amber-500/20 text-amber-300" },
    { stage: "VISITED", title: "Visited", color: "border-indigo-800 bg-indigo-950/20 text-indigo-300", badgeBg: "bg-indigo-500/20 text-indigo-300" },
    { stage: "DEMO_COMPLETED", title: "Demo Done", color: "border-cyan-800 bg-cyan-950/20 text-cyan-300", badgeBg: "bg-cyan-500/20 text-cyan-300" },
    { stage: "TRIAL", title: "Active Trial", color: "border-purple-800 bg-purple-950/20 text-purple-300", badgeBg: "bg-purple-500/20 text-purple-300" },
    { stage: "NEGOTIATION", title: "Negotiation", color: "border-blue-800 bg-blue-950/20 text-blue-300", badgeBg: "bg-blue-500/20 text-blue-300" },
    { stage: "WON", title: "Won Customer", color: "border-emerald-700 bg-emerald-950/30 text-emerald-300", badgeBg: "bg-emerald-500/20 text-emerald-300" },
    { stage: "LOST", title: "Lost Lead", color: "border-rose-900 bg-rose-950/20 text-rose-300", badgeBg: "bg-rose-500/20 text-rose-300" },
  ];

  const filteredGyms = gyms.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRep = selectedRep === "ALL" || g.assigned_salesperson_id === selectedRep;
    return matchesSearch && matchesRep;
  });

  const handleDragStart = (e: React.DragEvent, gymId: string) => {
    e.dataTransfer.setData("text/plain", gymId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedGymId(gymId);
  };

  const handleDragEnd = () => {
    setDraggedGymId(null);
    setActiveDropStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (activeDropStage !== stage) {
      setActiveDropStage(stage);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const gymId = e.dataTransfer.getData("text/plain") || draggedGymId;
    setActiveDropStage(null);
    setDraggedGymId(null);

    if (!gymId) return;

    if (targetStage === "LOST") {
      setPendingLostGymId(gymId);
      setShowLostModal(true);
      return;
    }

    opsStore.updateGymStage(gymId, targetStage);
    setGyms([...opsStore.getGyms()]);
  };

  const confirmLost = () => {
    if (!pendingLostGymId) return;
    opsStore.updateGymStage(pendingLostGymId, "LOST", lostReason, lostNotes);
    setGyms([...opsStore.getGyms()]);
    setShowLostModal(false);
    setPendingLostGymId(null);
    setLostNotes("");
  };

  const lostReasons: LostReason[] = [
    "Price too high",
    "Already using software",
    "Doesn't need software",
    "Wants different features",
    "Not ready now",
    "Business too small",
    "Owner unavailable",
    "Competitor",
    "No response",
    "Other",
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Sales & Gym Pipeline"
        subtitle="Interactive drag-and-drop deal pipeline from initial prospect to converted gym customer."
        actions={
          <Link
            href="/crm/leads"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Gym Lead
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 mb-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter pipeline by gym name, owner, area..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rep:</span>
          </div>
          <select
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Sales Representatives</option>
            <option value="usr_sales_1">Arun Sales (Salesperson A)</option>
            <option value="usr_sales_2">Priya Sales (Salesperson B)</option>
          </select>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-2 pl-1">
        <GripVertical className="w-3.5 h-3.5 text-emerald-400" />
        <span>Tip: Drag any gym card directly into another column to update deal progression in real-time.</span>
      </div>

      {/* Kanban Board Container with horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-250px)]">
        {stages.map((st) => {
          const stageGyms = filteredGyms.filter((g) => g.stage === st.stage);
          const stageTotal = stageGyms.reduce((acc, g) => acc + (g.expected_revenue || 0), 0);
          const isDropActive = activeDropStage === st.stage;

          return (
            <div
              key={st.stage}
              onDragOver={(e) => handleDragOver(e, st.stage)}
              onDragLeave={() => {
                if (activeDropStage === st.stage) setActiveDropStage(null);
              }}
              onDrop={(e) => handleDrop(e, st.stage)}
              className={`w-72 shrink-0 flex flex-col rounded-3xl border transition-all duration-200 shadow-xl ${
                isDropActive
                  ? "bg-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-emerald-500/10"
                  : "bg-slate-900/60 border-slate-800/80"
              }`}
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b border-slate-800 rounded-t-3xl ${st.color}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {st.title}
                  </span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${st.badgeBg}`}>
                    {stageGyms.length}
                  </span>
                </div>
                <div className="text-[11px] font-mono mt-1 font-semibold opacity-90">
                  {formatCurrency(stageTotal)}
                </div>
              </div>

              {/* Cards Container & Drop Area */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[640px] relative">
                {isDropActive && (
                  <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-500/60 bg-emerald-500/10 text-center text-xs font-semibold text-emerald-400 animate-pulse">
                    Drop to move to {st.title}
                  </div>
                )}

                {stageGyms.length === 0 && !isDropActive ? (
                  <div className="text-center py-12 text-slate-600 text-xs italic">
                    No gyms in this stage
                  </div>
                ) : (
                  stageGyms.map((g) => {
                    const isDragging = draggedGymId === g.id;

                    return (
                      <div
                        key={g.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, g.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3.5 rounded-2xl bg-slate-950/90 border transition-all duration-200 cursor-grab active:cursor-grabbing select-none group shadow-md hover:shadow-lg ${
                          isDragging
                            ? "opacity-30 border-dashed border-emerald-500 scale-95"
                            : "border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950"
                        }`}
                      >
                        {/* Drag Handle & Gym Name */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-start gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 shrink-0 mt-0.5 transition-colors" />
                            <Link
                              href={`/crm/gyms/${g.id}`}
                              className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors leading-snug"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {g.name}
                            </Link>
                          </div>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                            {g.business_type}
                          </span>
                        </div>

                        {/* Owner & Location */}
                        <div className="text-[11px] text-slate-400 mt-2 pl-5 space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-300">
                            <span>Owner: <strong>{g.owner_name}</strong></span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                            <MapPin className="w-2.5 h-2.5 text-slate-500" />
                            <span>{g.area}, {g.city}</span>
                          </div>
                        </div>

                        {/* Card Footer: Deal Value and Quick Links */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] pl-5">
                          <span className="font-mono font-bold text-emerald-400">
                            {formatCurrency(g.expected_revenue || 0)}
                          </span>

                          <Link
                            href={`/crm/gyms/${g.id}`}
                            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Open Gym Profile"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lost Reason Modal (triggered when dropping into LOST) */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-white">Record Lost Lead Reason</h3>
            </div>
            <p className="text-xs text-slate-400">
              Every lost gym deal must track a reason for product pricing and competitor intelligence.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-300">Lost Reason *</label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value as LostReason)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
              >
                {lostReasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-300">Notes / Feedback from Owner</label>
              <textarea
                rows={3}
                value={lostNotes}
                onChange={(e) => setLostNotes(e.target.value)}
                placeholder="Specific comments provided by the owner..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowLostModal(false);
                  setPendingLostGymId(null);
                }}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLost}
                className="px-4 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl"
              >
                Confirm Move to Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
