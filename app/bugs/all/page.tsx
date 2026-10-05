"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bug as BugIcon,
  Plus,
  Search,
  AlertTriangle,
  Layers,
  UserCheck,
  X,
  ExternalLink,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge, SeverityBadge } from "@/components/shared/PriorityBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { opsStore } from "@/lib/services/ops-store";
import { Bug, BugSeverity, Priority, BugStatus } from "@/types";

export default function AllBugsPage() {
  const [bugs, setBugs] = useState<Bug[]>(opsStore.getBugs());
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);

  const modules = opsStore.getModules();
  const users = opsStore.getUsers();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    module_id: "mod_1",
    severity: "MAJOR" as BugSeverity,
    priority: "P1" as Priority,
    environment: "Production" as const,
    app_version: "v1.4.2",
    expected_result: "",
    actual_result: "",
    steps_to_reproduce: "",
    assigned_to_id: "usr_dev_1",
  });

  const filteredBugs = bugs.filter((b) => {
    const matchesSearch =
      b.bug_id.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.module_name.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || b.severity === severityFilter;
    const matchesPriority = priorityFilter === "ALL" || b.priority === priorityFilter;
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesPriority && matchesStatus;
  });

  const handleCreateBug = (e: React.FormEvent) => {
    e.preventDefault();
    const mod = modules.find((m) => m.id === formData.module_id);
    const dev = users.find((u) => u.id === formData.assigned_to_id);
    if (!mod) return;

    opsStore.createBug({
      title: formData.title,
      description: formData.description,
      module_id: mod.id,
      module_name: mod.name,
      reporter_id: "usr_qa_1",
      reporter_name: "Ananya QA",
      assigned_to_id: dev?.id,
      assigned_to_name: dev?.name,
      qa_owner_id: "usr_qa_1",
      qa_owner_name: "Ananya QA",
      severity: formData.severity,
      priority: formData.priority,
      environment: formData.environment,
      app_version: formData.app_version,
      expected_result: formData.expected_result,
      actual_result: formData.actual_result,
      steps_to_reproduce: formData.steps_to_reproduce,
      status: "REPORTED",
    });

    setBugs([...opsStore.getBugs()]);
    setShowModal(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Bug & Issue Tracking"
        subtitle="First-class bug management with decoupled Severity vs Priority triage, QA verification, and release signoffs."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-md shadow-rose-500/20"
          >
            <Plus className="w-4 h-4" />
            Report New Bug
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bug ID (e.g. BUG-1042), title, or module..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="MAJOR">Major</option>
            <option value="MINOR">Minor</option>
            <option value="COSMETIC">Cosmetic</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="P0">P0 Immediate</option>
            <option value="P1">P1 Very High</option>
            <option value="P2">P2 Normal</option>
            <option value="P3">P3 Low</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="FIXED">Fixed</option>
            <option value="QA_TESTING">QA Testing</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>
        </div>
      </div>

      {/* Bugs Table */}
      {filteredBugs.length === 0 ? (
        <EmptyState
          title="No Bugs Found"
          description="No issues match the current filter or search criteria."
          actionLabel="Report a Bug"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Bug ID & Title</th>
                  <th className="px-5 py-3.5">Module</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Assignee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBugs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Bug ID & Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400 text-xs">{b.bug_id}</span>
                        <Link
                          href={`/bugs/${b.id}`}
                          className="font-semibold text-white hover:text-rose-300 transition-colors"
                        >
                          {b.title}
                        </Link>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {b.description}
                      </p>
                    </td>

                    {/* Module */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {b.module_name}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="px-5 py-4">
                      <SeverityBadge severity={b.severity} />
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <PriorityBadge priority={b.priority} />
                    </td>

                    {/* Assignee */}
                    <td className="px-5 py-4 text-slate-200">
                      {b.assigned_to_name || "Unassigned"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* View Details */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/bugs/${b.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-xs"
                      >
                        Inspect
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Bug Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Report New Bug / Regression</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBug} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Bug Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Attendance count incorrect after member renewal"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Module</label>
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
                  <label className="font-semibold text-slate-300">Assign To Developer</label>
                  <select
                    value={formData.assigned_to_id}
                    onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Severity vs Priority Decoupled */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="space-y-1">
                  <label className="font-semibold text-rose-400">Severity (Impact on System)</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as BugSeverity })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="CRITICAL">Critical (Blocks operations)</option>
                    <option value="MAJOR">Major (Feature broken)</option>
                    <option value="MINOR">Minor (Workaround exists)</option>
                    <option value="COSMETIC">Cosmetic (Typo / Visual)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-amber-400">Priority (Resolution Urgency)</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="P0">P0 Immediate (Hotfix)</option>
                    <option value="P1">P1 Very High (Next Build)</option>
                    <option value="P2">P2 Normal (Current Sprint)</option>
                    <option value="P3">P3 Low (Backlog)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Expected Result *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.expected_result}
                    onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Actual Result *</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.actual_result}
                    onChange={(e) => setFormData({ ...formData, actual_result: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Steps to Reproduce *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.steps_to_reproduce}
                  onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })}
                  placeholder="1. Navigate to...\n2. Click on...\n3. Observe error..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-rose-500 text-slate-950 font-semibold rounded-xl">
                  Submit Bug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
