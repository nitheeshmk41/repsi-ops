"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Bug as BugIcon,
  ArrowLeft,
  AlertTriangle,
  UserCheck,
  Layers,
  CheckCircle2,
  Clock,
  FlaskConical,
  RotateCcw,
  ShieldCheck,
  Send,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge, SeverityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";
import { BugStatus, Priority } from "@/types";
import { formatDate } from "@/lib/utils";

export default function BugDetailPage() {
  const params = useParams();
  const bugId = params.id as string;
  const bug = opsStore.getBugById(bugId) || opsStore.getBugs()[0];

  const [currentStatus, setCurrentStatus] = useState<BugStatus>(bug?.status || "REPORTED");
  const [currentPriority, setCurrentPriority] = useState<Priority>(bug?.priority || "P1");
  const [assignedDev, setAssignedDev] = useState(bug?.assigned_to_name || "Dev Rohan");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ author: string; text: string; time: string }[]>([
    {
      author: "Ananya QA",
      text: "Observed during staging smoke tests on build v1.5.0-rc1. Can reproduce 100% of the time.",
      time: "2026-10-05 10:15 AM",
    },
  ]);

  if (!bug) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-white">Bug Not Found</h2>
          <Link href="/bugs/all" className="text-rose-400 text-xs underline mt-2 inline-block">
            Back to All Bugs
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleStatusUpdate = (status: BugStatus) => {
    opsStore.updateBugStatus(bug.id, status);
    setCurrentStatus(status);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText) return;
    setComments([
      ...comments,
      {
        author: "Dev Rohan (Assigned)",
        text: commentText,
        time: "Just now",
      },
    ]);
    setCommentText("");
  };

  return (
    <AppLayout>
      <Link
        href="/bugs/all"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Bug Tracker
      </Link>

      {/* Bug Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-base font-extrabold text-rose-400 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30">
                {bug.bug_id}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">{bug.title}</h1>
              <StatusBadge status={currentStatus} size="md" />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Layers className="w-3.5 h-3.5" />
                Module: <strong className="text-white">{bug.module_name}</strong>
              </span>
              <span>•</span>
              <span>Reporter: <strong className="text-slate-300">{bug.reporter_name}</strong></span>
              <span>•</span>
              <span>Environment: <strong className="text-slate-300">{bug.environment} ({bug.app_version})</strong></span>
            </div>
          </div>

          {/* Quick Lifecycle Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentStatus !== "FIXED" && currentStatus !== "QA_TESTING" && currentStatus !== "CLOSED" && (
              <button
                onClick={() => handleStatusUpdate("FIXED")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Fixed
              </button>
            )}

            {currentStatus === "FIXED" && (
              <button
                onClick={() => handleStatusUpdate("QA_TESTING")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-500 hover:bg-purple-400 text-slate-950 flex items-center gap-1.5"
              >
                <FlaskConical className="w-4 h-4" />
                Send to QA Testing
              </button>
            )}

            {currentStatus === "QA_TESTING" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("CLOSED")}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  QA Signoff & Close
                </button>
                <button
                  onClick={() => handleStatusUpdate("REOPENED")}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reject & Reopen
                </button>
              </>
            )}

            {currentStatus === "CLOSED" && (
              <button
                onClick={() => handleStatusUpdate("REOPENED")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Reopen Bug
              </button>
            )}
          </div>
        </div>

        {/* Severity vs Priority Badges */}
        <div className="flex items-center gap-4 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Severity:</span>
            <SeverityBadge severity={bug.severity} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Priority:</span>
            <PriorityBadge priority={currentPriority} />
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assigned Developer: </span>
            <strong className="text-white">{assignedDev}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Steps & Reproduction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Reproduction & Technical Details (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Steps to Reproduce */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Steps to Reproduce
            </h3>
            <pre className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {bug.steps_to_reproduce}
            </pre>
          </div>

          {/* Expected vs Actual Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                Expected Behavior
              </span>
              <p className="text-slate-200 leading-relaxed mt-1">{bug.expected_result}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-900/40 bg-rose-950/10 space-y-1">
              <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
                Actual Defect Behavior
              </span>
              <p className="text-rose-200/90 leading-relaxed mt-1">{bug.actual_result}</p>
            </div>
          </div>

          {/* Developer Discussion & Comments */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Investigation Notes & Comments</h3>

            <div className="space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400">{c.author}</span>
                    <span className="text-slate-500">{c.time}</span>
                  </div>
                  <p className="text-slate-200">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post investigation note or pull request link..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Comment
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: QA Status & Triage (1 col) */}
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-purple-400" />
              QA Verification Status
            </h3>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">QA Owner:</span>
                <strong>{bug.qa_owner_name || "Ananya QA"}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Target Resolution:</span>
                <strong className="font-mono text-emerald-400">{bug.due_date || "2026-10-07"}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Fixed Date:</span>
                <strong className="font-mono">{bug.fixed_date || "Pending Fix"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
