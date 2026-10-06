"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  ArrowRight,
  Search,
  Filter,
  X,
  Pencil,
  Trash2,
  Calendar,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { opsStore } from "@/lib/services/ops-store";
import { RepsiModule, ModuleStatus, UserProfile } from "@/types";

const MODULE_STATUS_OPTIONS: { value: ModuleStatus; label: string }[] = [
  { value: "PLANNED", label: "Planned" },
  { value: "DESIGN", label: "Design / Spec" },
  { value: "DEVELOPMENT", label: "In Development" },
  { value: "CODE_REVIEW", label: "Code Review" },
  { value: "QA", label: "QA Testing" },
  { value: "COMPLETED", label: "Completed / Live" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "ON_HOLD", label: "On Hold" },
];

export default function ModulesPage() {
  const [modules, setModules] = useState<RepsiModule[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModule, setEditingModule] = useState<RepsiModule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State for Add / Edit Module
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "DEVELOPMENT" as ModuleStatus,
    owner_id: "",
    owner_name: "",
    priority: "P1" as "P0" | "P1" | "P2" | "P3",
    progress_percent: 0,
    release_name: "v1.5.0",
    start_date: new Date().toISOString().split("T")[0],
    deadline: "",
  });

  useEffect(() => {
    opsStore.ensureHydrated();
    setModules([...opsStore.getModules()]);
    const currentUsers = opsStore.getUsers();
    setUsers([...currentUsers]);

    if (currentUsers.length > 0) {
      setFormData((prev) => ({
        ...prev,
        owner_id: prev.owner_id || currentUsers[0]?.id || "",
        owner_name: prev.owner_name || currentUsers[0]?.name || "",
      }));
    }

    const unsub = opsStore.subscribe(() => {
      setModules([...opsStore.getModules()]);
      setUsers([...opsStore.getUsers()]);
    });
    return unsub;
  }, []);

  // Filter modules
  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      (m.owner_name && m.owner_name.toLowerCase().includes(search.toLowerCase())) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    const defaultUser = users[0];
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "DEVELOPMENT",
      owner_id: defaultUser?.id || "",
      owner_name: defaultUser?.name || "Unassigned",
      priority: "P1",
      progress_percent: 0,
      release_name: "v1.5.0",
      start_date: new Date().toISOString().split("T")[0],
      deadline: "",
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (m: RepsiModule) => {
    setEditingModule(m);
    setFormData({
      name: m.name,
      code: m.code,
      description: m.description,
      status: m.status,
      owner_id: m.owner_id,
      owner_name: m.owner_name,
      priority: m.priority,
      progress_percent: m.progress_percent,
      release_name: m.release_name || "v1.5.0",
      start_date: m.start_date || "",
      deadline: m.deadline || "",
    });
  };

  const handleOwnerChange = (userId: string) => {
    const selected = users.find((u) => u.id === userId);
    setFormData((prev) => ({
      ...prev,
      owner_id: userId,
      owner_name: selected ? selected.name : "Unassigned",
    }));
  };

  const handleNameChange = (name: string) => {
    // If code hasn't been manually set or matches previous auto code, generate from name
    let code = formData.code;
    if (!editingModule && (!code || code.startsWith("MOD-"))) {
      const slug = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 8);
      code = slug ? `MOD-${slug}` : "";
    }
    setFormData((prev) => ({ ...prev, name, code }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a module name.");
      return;
    }

    const finalCode =
      formData.code.trim().toUpperCase() ||
      `MOD-${formData.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "CORE"}`;

    if (editingModule) {
      opsStore.updateModule(editingModule.id, {
        name: formData.name.trim(),
        code: finalCode,
        description: formData.description.trim(),
        status: formData.status,
        owner_id: formData.owner_id,
        owner_name: formData.owner_name,
        priority: formData.priority,
        progress_percent: Number(formData.progress_percent),
        release_name: formData.release_name.trim(),
        start_date: formData.start_date || undefined,
        deadline: formData.deadline || undefined,
      });
      setEditingModule(null);
    } else {
      opsStore.createModule({
        name: formData.name.trim(),
        code: finalCode,
        description: formData.description.trim(),
        status: formData.status,
        owner_id: formData.owner_id || "usr_unassigned",
        owner_name: formData.owner_name || "Unassigned",
        priority: formData.priority,
        progress_percent: Number(formData.progress_percent) || 0,
        release_name: formData.release_name.trim() || "v1.5.0",
        start_date: formData.start_date || undefined,
        deadline: formData.deadline || undefined,
      });
      setShowAddModal(false);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    opsStore.deleteModule(id);
    setDeletingId(null);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Product Modules & Architecture"
        subtitle="Manage core functional modules, development progress, and engineering ownership."
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Module
          </button>
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by module name, code, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="ALL">All Statuses ({modules.length})</option>
            {MODULE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Modules */}
      {filteredModules.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No modules found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search query or status filter."
              : "Get started by adding your first product module."}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Module
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 shadow-xl flex flex-col justify-between transition-all group relative"
            >
              <div>
                {/* Header with Code, Priority, and Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      {m.code}
                    </span>
                    <PriorityBadge priority={m.priority} />
                  </div>
                  <StatusBadge status={m.status} />
                </div>

                {/* Title and Description */}
                <div className="mt-3">
                  <Link
                    href={`/product/modules/${m.id}`}
                    className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors"
                  >
                    {m.name}
                  </Link>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {m.description || "No description provided."}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Module Completion</span>
                    <span className="font-mono font-bold text-white">{m.progress_percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, m.progress_percent))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer with Owner, Release, Edit & Details */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-slate-400 truncate max-w-[130px]">
                  <span className="text-slate-500">Owner: </span>
                  <strong className="text-slate-200">{m.owner_name}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {m.release_name || "v1.5.0"}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(m)}
                    title="Edit Module"
                    className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingId(m.id)}
                    title="Delete Module"
                    className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/product/modules/${m.id}`}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Module Modal */}
      {(showAddModal || editingModule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingModule ? "Edit Module" : "Add Product Module"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingModule
                      ? "Update module architecture, ownership, or release status"
                      : "Create a new functional module for tracking engineering ownership"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingModule(null);
                }}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Module Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Module Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Subscription & Billing Engine"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Module Code & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Module Code <span className="text-slate-500">(Unique ID)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., MOD-BILLING"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full font-mono bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: e.target.value as "P0" | "P1" | "P2" | "P3",
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize the module's core functionality and scope..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Owner / Assignee */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Engineering Owner / Assignee
                </label>
                <select
                  value={formData.owner_id}
                  onChange={(e) => handleOwnerChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {users.length === 0 && <option value="">No assignees registered</option>}
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.email} ({u.role})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Need a new assignee? Add them in the{" "}
                  <Link href="/project/assignees" className="text-emerald-400 hover:underline">
                    Assignees Directory
                  </Link>
                  .
                </p>
              </div>

              {/* Status & Target Release */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Module Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as ModuleStatus,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {MODULE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Release
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., v1.5.0"
                    value={formData.release_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, release_name: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Progress & Target Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Progress: {formData.progress_percent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress_percent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        progress_percent: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingModule(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer font-bold"
                >
                  {editingModule ? "Update Module" : "Save Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Module?</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Are you sure you want to delete this module? Any linked tasks or bugs will remain in the database.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
