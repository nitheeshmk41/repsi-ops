"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  FileText,
  MapPin,
  ExternalLink,
  Plus,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  UserCheck,
  CreditCard,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PipelineStage, LostReason } from "@/types";

export default function GymDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gymId = params.id as string;

  const gym = opsStore.getGymById(gymId);
  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "visits" | "followups" | "feedback" | "requests"
  >("overview");

  // Local state for interactive stage change
  const [currentStage, setCurrentStage] = useState<PipelineStage>(gym?.stage || "PROSPECT");
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState<LostReason>("Price too high");
  const [lostNotes, setLostNotes] = useState("");

  // Quick Action Modal states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");

  if (!gym) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-white">Gym Record Not Found</h2>
          <p className="text-sm text-slate-400 mt-2">The requested gym ID does not exist in Repsi Ops.</p>
          <Link href="/crm/leads" className="inline-block mt-4 text-emerald-400 underline text-xs">
            Return to CRM Leads
          </Link>
        </div>
      </AppLayout>
    );
  }

  const activities = opsStore.getActivities(gym.id);
  const visits = opsStore.getVisits().filter((v) => v.gym_id === gym.id);
  const followUps = opsStore.getFollowUps().filter((f) => f.gym_id === gym.id);
  const featureRequests = opsStore.getFeatureRequests().filter((fr) => fr.gym_id === gym.id);

  const handleStageChange = (newStage: PipelineStage) => {
    if (newStage === "LOST") {
      setShowLostModal(true);
      return;
    }
    opsStore.updateGymStage(gym.id, newStage);
    setCurrentStage(newStage);
  };

  const handleConfirmLost = () => {
    opsStore.updateGymStage(gym.id, "LOST", lostReason, lostNotes);
    setCurrentStage("LOST");
    setShowLostModal(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote) return;

    opsStore.logActivity({
      gym_id: gym.id,
      user_id: "usr_admin_1",
      user_name: "Internal Rep",
      type: "NOTE",
      title: "Field Sales Note Added",
      description: newNote,
    });

    setNewNote("");
    setShowNoteModal(false);
  };

  const stages: PipelineStage[] = [
    "PROSPECT",
    "CONTACTED",
    "VISIT_PLANNED",
    "VISITED",
    "DEMO_SCHEDULED",
    "DEMO_COMPLETED",
    "TRIAL",
    "NEGOTIATION",
    "WON",
    "NOT_INTERESTED",
    "LOST",
  ];

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
      {/* Back button */}
      <div>
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to CRM Leads
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-emerald-500/20 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">{gym.name}</h1>
                <StatusBadge status={currentStage} size="md" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {gym.business_type}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Owner: <span className="font-semibold text-white ml-0.5">{gym.owner_name}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {gym.area}, {gym.city}
                </span>
                <span>•</span>
                <span>
                  Salesperson: <span className="text-slate-200">{gym.assigned_salesperson_name || "Unassigned"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Call, WhatsApp, Email, Schedule Visit, Add Note) */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`tel:${gym.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Call
            </a>

            <a
              href={`https://wa.me/${gym.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp
            </a>

            {gym.email && (
              <a
                href={`mailto:${gym.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Email
              </a>
            )}

            <button
              onClick={() => setShowNoteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Add Note
            </button>
          </div>
        </div>

        {/* Stage Progress Bar / Selector */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Pipeline Progression
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {stages.map((st) => (
              <button
                key={st}
                onClick={() => handleStageChange(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  currentStage === st
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 border-slate-800"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Intelligence" },
          { id: "timeline", label: `Gym Timeline (${activities.length})` },
          { id: "visits", label: `Visits (${visits.length})` },
          { id: "followups", label: `Follow-ups (${followUps.length})` },
          { id: "requests", label: `Feature Requests (${featureRequests.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-emerald-400 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Business Information Card */}
          <div className="card-subtle p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Business Profile
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total Members:</span>
                <span className="font-semibold text-white">{gym.members_count || "Not disclosed"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Trainers on Floor:</span>
                <span className="font-semibold text-white">{gym.trainers_count || "6-8"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Branches Count:</span>
                <span className="font-semibold text-white">{gym.branches_count || 1}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Business Size:</span>
                <span className="font-semibold text-white">{gym.business_size || "Medium"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Expected Contract Value:</span>
                <span className="font-semibold text-emerald-400 font-mono">
                  {formatCurrency(gym.expected_revenue || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Software & Systems Card */}
          <div className="card-subtle p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Current Tech Stack
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Current Management:</span>
                <span className="font-semibold text-white">{gym.current_software || "Excel / Manual"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Current Payment Mode:</span>
                <span className="font-semibold text-white">{gym.current_payment_system || "Cash / UPI QR"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Instagram:</span>
                <span className="font-semibold text-cyan-400">{gym.instagram || "@abcfitness_coimbatore"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Address:</span>
                <span className="font-semibold text-slate-300 text-right max-w-[200px] truncate">{gym.address}</span>
              </div>
            </div>
          </div>

          {/* Sales Status Card */}
          <div className="card-subtle p-5 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Sales Intelligence
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Primary Pain Point</div>
                <p className="text-slate-200 mt-1">
                  &ldquo;Members entering without renewals and lack of automated WhatsApp reminders.&rdquo;
                </p>
              </div>
              {gym.lost_reason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <div className="text-[11px] font-semibold uppercase">Lost Reason: {gym.lost_reason}</div>
                  <p className="mt-1 text-[11px]">{gym.lost_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Timeline */}
      {activeTab === "timeline" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Gym Activity Timeline</h3>
            <button
              onClick={() => setShowNoteModal(true)}
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
            >
              + Log Interaction
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {activities.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                <div className="text-[10px] text-slate-500 mt-1">
                  By {item.user_name} • {formatDate(item.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Visits */}
      {activeTab === "visits" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Sales Visits History</h3>
            <Link
              href="/sales/today"
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
            >
              Schedule New Visit
            </Link>
          </div>

          {visits.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No visits recorded for this gym yet.</p>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{v.time_slot}</span>
                      <StatusBadge status={v.status} />
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(v.scheduled_at)}</span>
                  </div>
                  {v.response_notes && (
                    <div className="text-xs text-slate-300 mt-1">
                      <span className="font-semibold text-slate-400">Report: </span>
                      {v.response_notes}
                    </div>
                  )}
                  {v.next_action && (
                    <div className="text-xs text-emerald-400 mt-0.5">
                      <span className="font-semibold">Next Action: </span>
                      {v.next_action} (Due: {v.next_followup_date || "Soon"})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Follow-ups */}
      {activeTab === "followups" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Follow-up Tasks</h3>
          {followUps.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No pending follow-ups.</p>
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{f.notes}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono">
                        {f.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Due: {f.due_date} • Assigned: {f.assigned_to_name}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      opsStore.completeFollowUp(f.id);
                      alert("Follow-up marked completed!");
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                  >
                    Mark Done
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Feature Requests */}
      {activeTab === "requests" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Connected Feature Requests</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Features requested by {gym.name} linked directly to Product Roadmap & Releases.
              </p>
            </div>
            <Link
              href="/product/feature-requests"
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
            >
              + Create Request
            </Link>
          </div>

          {featureRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No feature requests linked to this gym.</p>
          ) : (
            <div className="space-y-3">
              {featureRequests.map((fr) => (
                <div key={fr.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{fr.request_code}</span>
                      <span className="text-xs font-semibold text-white">{fr.title}</span>
                    </div>
                    <StatusBadge status={fr.status} />
                  </div>
                  <p className="text-xs text-slate-300">{fr.description}</p>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-3">
                    <span>Module: {fr.module_name}</span>
                    <span>•</span>
                    <span>Target Release: {fr.target_release_name || "Unassigned"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lost Reason Modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Record Lost Lead Reason</h3>
            <p className="text-xs text-slate-400">
              Every lost gym lead must have a tracked reason to feed our product pricing and competitor analysis.
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
              <label className="font-semibold text-slate-300">Detailed Notes</label>
              <textarea
                rows={3}
                value={lostNotes}
                onChange={(e) => setLostNotes(e.target.value)}
                placeholder="Specific comments or feedback provided by owner..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLostModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLost}
                className="px-4 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl"
              >
                Mark as Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleAddNote} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Log Interaction / Sales Note</h3>
            <textarea
              required
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Spoke to owner over WhatsApp. Provided quotation with 1-year annual pass discount..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
