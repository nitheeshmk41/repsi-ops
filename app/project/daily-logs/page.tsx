"use client";

import React, { useState } from "react";
import {
  FileText,
  Calendar,
  UserCheck,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { opsStore } from "@/lib/services/ops-store";
import { useAuth } from "@/lib/auth/context";
import { DailyWorkLog } from "@/types";

export default function DailyLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyWorkLog[]>(opsStore.getDailyLogs());

  // Form State
  const [completedToday, setCompletedToday] = useState(
    "- Fixed attendance API query optimization\n- Tested membership renewal edge cases"
  );
  const [inProgress, setInProgress] = useState(
    "- Investigating BUG-1043 critical payment webhook error\n- Reviewing Trainer module database relationships"
  );
  const [blocked, setBlocked] = useState(
    "- Waiting for API credentials for WhatsApp notification service"
  );
  const [tomorrowPlan, setTomorrowPlan] = useState(
    "- Complete payment integration fixes\n- Ship v1.5.0-rc2 to QA staging"
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = opsStore.createDailyLog({
      user_id: user?.id || "usr_dev_1",
      user_name: user?.name || "Dev Rohan",
      date: new Date().toISOString().split("T")[0],
      completed_today: completedToday,
      in_progress: inProgress,
      blocked: blocked,
      tomorrow_plan: tomorrowPlan,
    });

    setLogs([...opsStore.getDailyLogs()]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Daily Standup & Work Logs"
        subtitle="Submit your daily engineering accomplishments, active tasks, blockers, and tomorrow's goals."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submission Form (1 col) */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Submit My Daily Log
              </h3>
              <span className="font-mono text-slate-400">
                {new Date().toISOString().split("T")[0]}
              </span>
            </div>

            {submitted && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Daily log submitted successfully!
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-emerald-400">
                Completed Today *
              </label>
              <textarea
                required
                rows={3}
                value={completedToday}
                onChange={(e) => setCompletedToday(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-cyan-400">
                In Progress *
              </label>
              <textarea
                required
                rows={3}
                value={inProgress}
                onChange={(e) => setInProgress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-rose-400">
                Blocked (If Any)
              </label>
              <textarea
                rows={2}
                value={blocked}
                onChange={(e) => setBlocked(e.target.value)}
                placeholder="Mention any impediments or external approvals needed..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-amber-400">
                Tomorrow&apos;s Plan *
              </label>
              <textarea
                required
                rows={3}
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Daily Standup
            </button>
          </form>
        </div>

        {/* Right Column: Team Daily Reports Stream (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            Company Daily Standup Feed
          </h3>

          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3.5 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                      {log.user_name[0]}
                    </div>
                    <span className="font-bold text-white">{log.user_name}</span>
                  </div>
                  <span className="font-mono text-slate-400">{log.date}</span>
                </div>

                {/* Completed */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Completed Today
                  </span>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed pl-2 border-l border-emerald-500/40">
                    {log.completed_today}
                  </p>
                </div>

                {/* In Progress */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    In Progress
                  </span>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed pl-2 border-l border-cyan-500/40">
                    {log.in_progress}
                  </p>
                </div>

                {/* Blocked */}
                {log.blocked && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Blockers
                    </span>
                    <p className="text-rose-200/90 whitespace-pre-line leading-relaxed pl-2 border-l border-rose-500/40">
                      {log.blocked}
                    </p>
                  </div>
                )}

                {/* Tomorrow */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Tomorrow&apos;s Plan
                  </span>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed pl-2 border-l border-amber-500/40">
                    {log.tomorrow_plan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
