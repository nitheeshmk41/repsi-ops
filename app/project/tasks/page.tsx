"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  UserCheck,
  Layers,
  X,
  AlertTriangle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";
import { Task, TaskStatus, Priority, RepsiModule, UserProfile } from "@/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modules, setModules] = useState<RepsiModule[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    module_id: "",
    assignee_id: "",
    priority: "P1" as Priority,
    due_date: new Date().toISOString().split("T")[0],
    estimated_hours: 8,
  });

  useEffect(() => {
    opsStore.ensureHydrated();
    const currentTasks = opsStore.getTasks();
    const currentModules = opsStore.getModules();
    const currentUsers = opsStore.getUsers();

    setTasks([...currentTasks]);
    setModules([...currentModules]);
    setUsers([...currentUsers]);

    if (currentModules.length > 0 || currentUsers.length > 0) {
      setFormData((prev) => ({
        ...prev,
        module_id: prev.module_id || currentModules[0]?.id || "",
        assignee_id: prev.assignee_id || currentUsers[0]?.id || "",
      }));
    }

    const unsubscribe = opsStore.subscribe(() => {
      setTasks([...opsStore.getTasks()]);
      setModules([...opsStore.getModules()]);
      setUsers([...opsStore.getUsers()]);
    });
    return unsubscribe;
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.module_name.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    opsStore.updateTaskStatus(taskId, status);
    setTasks([...opsStore.getTasks()]);
  };

  const handleOpenModal = () => {
    const currentModules = opsStore.getModules();
    const currentUsers = opsStore.getUsers();
    setFormData({
      title: "",
      description: "",
      module_id: currentModules[0]?.id || "",
      assignee_id: currentUsers[0]?.id || "",
      priority: "P1",
      due_date: new Date().toISOString().split("T")[0],
      estimated_hours: 8,
    });
    setShowModal(true);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const currentModules = opsStore.getModules();
    const currentUsers = opsStore.getUsers();

    const selectedModId = formData.module_id || currentModules[0]?.id;
    const mod = currentModules.find((m) => m.id === selectedModId) || currentModules[0];

    const selectedAssigneeId = formData.assignee_id || currentUsers[0]?.id;
    const assignee = currentUsers.find((u) => u.id === selectedAssigneeId) || currentUsers[0];

    opsStore.createTask({
      title: formData.title.trim(),
      description: formData.description.trim(),
      module_id: mod ? mod.id : "mod_1",
      module_name: mod ? mod.name : "Core Platform",
      assignee_id: assignee ? assignee.id : "usr_dev_1",
      assignee_name: assignee ? assignee.name : "Developer",
      reporter_id: "usr_pm_1",
      reporter_name: "Karthik PM",
      priority: formData.priority,
      status: "TODO",
      due_date: formData.due_date,
      estimated_hours: formData.estimated_hours || 4,
      actual_hours: 0,
    });

    setTasks([...opsStore.getTasks()]);
    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      module_id: currentModules[0]?.id || "",
      assignee_id: currentUsers[0]?.id || "",
      priority: "P1",
      due_date: new Date().toISOString().split("T")[0],
      estimated_hours: 8,
    });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Project Tasks & Engineering Sprint"
        subtitle="Manage sprint tasks, developer assignments, estimates, and code reviews."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/project/my-work"
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              My Work View
            </Link>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        }
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task title, module, or developer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="BLOCKED">Blocked</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Task Title</th>
                <th className="px-5 py-3.5">Module</th>
                <th className="px-5 py-3.5">Assignee</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Effort</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 italic">
                    No tasks found. Click &quot;New Task&quot; to create a sprint task.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white text-xs">{t.title}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                      {t.blocker_reason && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>Blocked: {t.blocker_reason}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {t.module_name}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-200 font-medium">
                      {t.assignee_name}
                    </td>

                    <td className="px-5 py-4">
                      <PriorityBadge priority={t.priority} />
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-300">
                      {t.due_date || "No deadline"}
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px]">
                      <span className="text-white font-bold">{t.actual_hours || 0}h</span>
                      <span className="text-slate-500"> / {t.estimated_hours || 0}h</span>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="IN_REVIEW">IN_REVIEW</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleCreateTask} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Create Sprint Task
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Task Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Implement Webhook Handlers"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details of the task requirements..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Module *</label>
                <select
                  value={formData.module_id || (modules[0] ? modules[0].id : "")}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Assignee *</label>
                <select
                  value={formData.assignee_id || (users[0] ? users[0].id : "")}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="P0">P0 Immediate</option>
                  <option value="P1">P1 High</option>
                  <option value="P2">P2 Normal</option>
                  <option value="P3">P3 Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Due Date *</label>
                <input
                  required
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Est. Hours</label>
                <input
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
