"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckSquare,
  ArrowLeft,
  Clock,
  Layers,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { opsStore } from "@/lib/services/ops-store";
import { TaskStatus } from "@/types";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const task = opsStore.getTaskById(taskId) || opsStore.getTasks()[0];

  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task?.status || "TODO");

  if (!task) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-white">Task Not Found</h2>
          <Link href="/project/tasks" className="text-emerald-400 text-xs underline mt-2 inline-block">
            Back to Tasks
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    opsStore.updateTaskStatus(task.id, newStatus);
    setCurrentStatus(newStatus);
  };

  return (
    <AppLayout>
      <Link
        href="/project/tasks"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Tasks
      </Link>

      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{task.title}</h1>
              <StatusBadge status={currentStatus} size="md" />
              <PriorityBadge priority={task.priority} />
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {task.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>

        {task.blocker_reason && (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Active Blocker: {task.blocker_reason}</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block">Module:</span>
            <strong className="text-cyan-400">{task.module_name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Assignee:</span>
            <strong>{task.assignee_name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Due Date:</span>
            <strong className="font-mono text-emerald-400">{task.due_date || "Sprint"}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Logged Effort:</span>
            <strong className="font-mono">{task.actual_hours || 0}h / {task.estimated_hours || 0}h</strong>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
