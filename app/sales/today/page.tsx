"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Building2,
  UserCheck,
  MapPin,
  CheckCircle,
  Plus,
  FileText,
  CalendarCheck,
  X,
  Phone,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { Visit } from "@/types";

export default function TodaySchedulePage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    opsStore.ensureHydrated();
    setVisits([...opsStore.getVisits()]);
    const unsubscribe = opsStore.subscribe(() => {
      setVisits([...opsStore.getVisits()]);
    });
    return unsubscribe;
  }, []);

  // Visit Report Form State
  const [reportData, setReportData] = useState({
    met_owner: true,
    person_met: "",
    role_of_person_met: "Gym Owner",
    interested: true,
    demo_required: true,
    current_software: "Excel Sheets",
    main_pain_point: "",
    budget: 35000,
    expected_decision_date: "",
    response_notes: "",
    next_followup_date: "",
    next_action: "WhatsApp follow-up with quotation and demo link",
    outcome: "High intent - Demo completed",
  });

  // Schedule Visit Form State
  const [scheduleData, setScheduleData] = useState({
    gym_id: "gym_1",
    time_slot: "11:00 AM",
    scheduled_at: new Date().toISOString(),
  });

  const gyms = opsStore.getGyms();

  const handleOpenReport = (v: Visit) => {
    setSelectedVisit(v);
    setReportData({
      met_owner: true,
      person_met: v.owner_name,
      role_of_person_met: "Gym Owner",
      interested: true,
      demo_required: true,
      current_software: "Excel Sheets",
      main_pain_point: "Members entering without renewals and lack of automated WhatsApp reminders",
      budget: 35000,
      expected_decision_date: "2026-10-14",
      response_notes: "",
      next_followup_date: "2026-10-08",
      next_action: "WhatsApp follow-up with pricing tier breakdown and demo video link",
      outcome: "High intent - Demo requested",
    });
    setShowReportModal(true);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    opsStore.submitVisitReport(selectedVisit.id, reportData);
    setVisits([...opsStore.getVisits()]);
    setShowReportModal(false);
    alert("Visit report submitted successfully! Follow-up automatically created in schedule.");
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const gym = gyms.find((g) => g.id === scheduleData.gym_id);
    if (!gym) return;

    opsStore.scheduleVisit({
      gym_id: gym.id,
      gym_name: gym.name,
      gym_area: gym.area,
      owner_name: gym.owner_name,
      salesperson_id: "usr_sales_1",
      salesperson_name: "Arun Sales (Salesperson A)",
      time_slot: scheduleData.time_slot,
      scheduled_at: scheduleData.scheduled_at,
      status: "SCHEDULED",
    });

    setVisits([...opsStore.getVisits()]);
    setShowScheduleModal(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Field Sales & Visits Schedule"
        subtitle="Daily on-ground itinerary for gym visits, owner meetings, and post-visit reports."
        actions={
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Visit
          </button>
        }
      />

      {/* Visits List */}
      <div className="space-y-4">
        {visits.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                <Clock className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {v.time_slot}
                  </span>
                  <StatusBadge status={v.status} />
                </div>

                <div className="mt-1">
                  <Link
                    href={`/crm/gyms/${v.gym_id}`}
                    className="text-base font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    {v.gym_name}
                  </Link>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>Owner: <strong className="text-slate-200">{v.owner_name}</strong></span>
                    <span>•</span>
                    <span>Location: <strong className="text-slate-200">{v.gym_area}</strong></span>
                    <span>•</span>
                    <span>Salesperson: <strong className="text-slate-200">{v.salesperson_name}</strong></span>
                  </div>
                </div>

                {v.response_notes && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Visit Summary: </span>
                    {v.response_notes}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/crm/gyms/${v.gym_id}`}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Gym Profile
              </Link>

              {v.status === "SCHEDULED" ? (
                <button
                  onClick={() => handleOpenReport(v)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Submit Visit Report
                </button>
              ) : (
                <button
                  onClick={() => handleOpenReport(v)}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Edit Report
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Visit Report Modal */}
      {showReportModal && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Field Sales Report: {selectedVisit.gym_name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record on-ground findings, software pain points, and schedule next follow-up.
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Person Met</label>
                  <input
                    required
                    type="text"
                    value={reportData.person_met}
                    onChange={(e) => setReportData({ ...reportData, person_met: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Role of Person Met</label>
                  <input
                    type="text"
                    value={reportData.role_of_person_met}
                    onChange={(e) => setReportData({ ...reportData, role_of_person_met: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={reportData.met_owner}
                    onChange={(e) => setReportData({ ...reportData, met_owner: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>Met Gym Owner Directly</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={reportData.demo_required}
                    onChange={(e) => setReportData({ ...reportData, demo_required: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                  <span>In-Depth Demo Required</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Main Customer Pain Point *</label>
                <input
                  required
                  type="text"
                  value={reportData.main_pain_point}
                  onChange={(e) => setReportData({ ...reportData, main_pain_point: e.target.value })}
                  placeholder="e.g. Receptionist forgetting renewals, members cheating attendance"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Estimated Budget (INR)</label>
                  <input
                    type="number"
                    value={reportData.budget}
                    onChange={(e) => setReportData({ ...reportData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Expected Decision Date</label>
                  <input
                    type="date"
                    value={reportData.expected_decision_date}
                    onChange={(e) => setReportData({ ...reportData, expected_decision_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Visit Response & Notes</label>
                <textarea
                  rows={3}
                  value={reportData.response_notes}
                  onChange={(e) => setReportData({ ...reportData, response_notes: e.target.value })}
                  placeholder="Owner's specific reaction, team vibe, current hardware/printers..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                <div className="font-semibold text-emerald-400">Next Action & Automatic Follow-up</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">Next Follow-up Date *</label>
                    <input
                      required
                      type="date"
                      value={reportData.next_followup_date}
                      onChange={(e) => setReportData({ ...reportData, next_followup_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Next Action Description</label>
                    <input
                      type="text"
                      value={reportData.next_action}
                      onChange={(e) => setReportData({ ...reportData, next_action: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                >
                  Submit Report & Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleScheduleVisit} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Schedule Field Sales Visit</h3>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Select Gym / Prospect</label>
              <select
                value={scheduleData.gym_id}
                onChange={(e) => setScheduleData({ ...scheduleData, gym_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.area}, {g.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Time Slot</label>
              <input
                required
                type="text"
                value={scheduleData.time_slot}
                onChange={(e) => setScheduleData({ ...scheduleData, time_slot: e.target.value })}
                placeholder="e.g. 10:30 AM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
              >
                Schedule Visit
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
