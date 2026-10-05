"use client";

import React, { useState } from "react";
import {
  Users,
  CheckSquare,
  Bug as BugIcon,
  Layers,
  AlertTriangle,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  X,
  UserPlus,
  Lock,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { opsStore } from "@/lib/services/ops-store";
import { useAuth } from "@/lib/auth/context";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/auth/rbac";
import { UserProfile, UserRole } from "@/types";

export default function TeamPage() {
  const { role, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>(opsStore.getUsers());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for creating a team member
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "DEVELOPER" as UserRole,
    department: "Engineering",
    phone: "",
    tempPassword: "repsi2026ops",
  });

  const availableRoles: { role: UserRole; department: string }[] = [
    { role: "ADMIN", department: "Executive" },
    { role: "FOUNDER", department: "Executive" },
    { role: "SALES", department: "Field Sales" },
    { role: "PROJECT_MANAGER", department: "Product Management" },
    { role: "DEVELOPER", department: "Engineering" },
    { role: "QA", department: "Quality Assurance" },
    { role: "MARKETING", department: "Growth & Marketing" },
    { role: "CUSTOMER_SUCCESS", department: "Customer Operations" },
  ];

  const handleRoleSelect = (selectedRole: UserRole) => {
    const matched = availableRoles.find((r) => r.role === selectedRole);
    setFormData({
      ...formData,
      role: selectedRole,
      department: matched ? matched.department : "Operations",
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please provide member name and company email.");
      return;
    }

    const created = opsStore.createUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      phone: formData.phone || undefined,
    });

    setUsers([...opsStore.getUsers()]);
    setShowAddModal(false);
    setFormData({
      name: "",
      email: "",
      role: "DEVELOPER",
      department: "Engineering",
      phone: "",
      tempPassword: "repsi2026ops",
    });
    alert(`Team member ${created.name} (${ROLE_LABELS[created.role]}) created successfully!`);
  };

  const isAdmin = role === "ADMIN" || role === "FOUNDER";

  return (
    <AppLayout>
      <PageHeader
        title="Team Operations & Workload"
        subtitle="Operational capacity tracking, internal access provision, defect handling, and team workload balance."
        actions={
          isAdmin ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Add Internal User
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>User provisioning restricted to Admin / Founder</span>
            </div>
          )
        }
      />

      {/* Grid of Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((u) => {
          const activeTasks = u.active_tasks_count || 0;
          const openBugs = u.open_bugs_count || 0;
          const workloadScore = Math.min(Math.round(activeTasks * 12 + openBugs * 15), 100);
          const isOverloaded = workloadScore > 75;

          return (
            <div
              key={u.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-extrabold text-slate-950 flex items-center justify-center text-sm shadow-md">
                    {u.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{u.name}</h3>
                    <div className="text-xs text-emerald-400 font-medium">
                      {ROLE_LABELS[u.role] || u.role}
                    </div>
                    <div className="text-[10px] text-slate-500">{u.department}</div>
                  </div>
                </div>

                {isOverloaded && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    High Load
                  </span>
                )}
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Operational Load</span>
                  <span className="font-mono font-bold text-white">{workloadScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOverloaded
                        ? "bg-gradient-to-r from-amber-500 to-rose-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    }`}
                    style={{ width: `${workloadScore}%` }}
                  />
                </div>
              </div>

              {/* Tasks & Bugs metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="font-bold text-white font-mono text-sm">{activeTasks}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Active Tasks</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="font-bold text-white font-mono text-sm">
                    {u.completed_tasks_count || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Completed</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div className="font-bold text-rose-400 font-mono text-sm">{openBugs}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Open Bugs</div>
                </div>
              </div>

              {/* Email & Contact */}
              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span className="truncate">{u.email}</span>
                {u.phone && <span>{u.phone}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Add Internal Team Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kannan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Company Email (@repsi.app) *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@repsi.app"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Operational Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.role} value={r.role}>
                        {ROLE_LABELS[r.role]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Phone (Optional)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Initial Password</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.tempPassword}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-400 font-mono"
                  />
                </div>
              </div>

              {/* Role Scope summary */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-emerald-400">Role Access Scope: </span>
                {ROLE_DESCRIPTIONS[formData.role]}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                >
                  Create & Provision Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
