"use client";

import React, { useState, useEffect } from "react";
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
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { opsStore } from "@/lib/services/ops-store";
import { useAuth } from "@/lib/auth/context";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/auth/rbac";
import { UserProfile, UserRole } from "@/types";

const ALL_ROLES: { role: UserRole; label: string; department: string; color: string }[] = [
  { role: "ADMIN", label: "Founder / Admin", department: "Executive", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { role: "FOUNDER", label: "Founder", department: "Executive", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { role: "SALES", label: "Field Sales", department: "Field Sales", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { role: "PROJECT_MANAGER", label: "Project Manager", department: "Product", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { role: "DEVELOPER", label: "Software Engineer", department: "Engineering", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  { role: "QA", label: "QA Engineer", department: "Quality Assurance", color: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  { role: "MARKETING", label: "Growth & Marketing", department: "Marketing", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { role: "CUSTOMER_SUCCESS", label: "Customer Success", department: "Customer Ops", color: "bg-teal-500/15 text-teal-400 border-teal-500/30" },
];

export default function TeamPage() {
  const { role, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for creating a team member with multiple roles
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roles: ["DEVELOPER"] as UserRole[],
    department: "Engineering",
    phone: "",
    tempPassword: "repsi2026ops",
  });

  // Form State for editing an existing team member
  const [editFormData, setEditFormData] = useState({
    name: "",
    department: "",
    phone: "",
    roles: [] as UserRole[],
  });

  const loadTeamMembers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/team/list");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      } else {
        setUsers(opsStore.getUsers());
      }
    } catch {
      setUsers(opsStore.getUsers());
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const isAdmin = role === "ADMIN" || role === "FOUNDER";

  // Toggle role in Add form
  const toggleAddRole = (r: UserRole) => {
    setFormData((prev) => {
      const exists = prev.roles.includes(r);
      if (exists) {
        if (prev.roles.length === 1) return prev; // Keep at least one
        return { ...prev, roles: prev.roles.filter((x) => x !== r) };
      } else {
        return { ...prev, roles: [...prev.roles, r] };
      }
    });
  };

  // Toggle role in Edit form
  const toggleEditRole = (r: UserRole) => {
    setEditFormData((prev) => {
      const exists = prev.roles.includes(r);
      if (exists) {
        if (prev.roles.length === 1) return prev; // Keep at least one
        return { ...prev, roles: prev.roles.filter((x) => x !== r) };
      } else {
        return { ...prev, roles: [...prev.roles, r] };
      }
    });
  };

  // Open Edit Modal
  const openEditModal = (u: UserProfile) => {
    const userRoles = u.roles && u.roles.length > 0 ? u.roles : [u.role];
    setEditFormData({
      name: u.name,
      department: u.department,
      phone: u.phone || "",
      roles: userRoles as UserRole[],
    });
    setEditingUser(u);
  };

  // Submit Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.tempPassword || formData.roles.length === 0) {
      alert("Please provide member name, company email, password, and at least one role.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/team/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          roles: formData.roles,
          department: formData.department,
          password: formData.tempPassword,
          phone: formData.phone || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(`Error: ${result.error || "Failed to create user in Appwrite"}`);
        setIsSubmitting(false);
        return;
      }

      alert(`Team member ${formData.name} created with ${formData.roles.length} role(s)!`);
      setShowAddModal(false);
      setFormData({
        name: "",
        email: "",
        roles: ["DEVELOPER"],
        department: "Engineering",
        phone: "",
        tempPassword: "repsi2026ops",
      });
      await loadTeamMembers();
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editFormData.name || editFormData.roles.length === 0) {
      alert("Please provide name and select at least one role.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/team/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editFormData.name,
          roles: editFormData.roles,
          department: editFormData.department,
          phone: editFormData.phone || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(`Error: ${result.error || "Failed to update user."}`);
        setIsSubmitting(false);
        return;
      }

      alert(`User ${editFormData.name} updated successfully!`);
      setEditingUser(null);
      await loadTeamMembers();
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    if (deletingUser.email.toLowerCase() === "contact@repsi.app") {
      alert("Cannot delete root Admin account (contact@repsi.app).");
      setDeletingUser(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/team/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deletingUser.id }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(`Error: ${result.error || "Failed to delete user."}`);
        setIsSubmitting(false);
        return;
      }

      alert(`User ${deletingUser.name} (${deletingUser.email}) removed from system.`);
      setDeletingUser(null);
      await loadTeamMembers();
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Team Operations & Workload"
        subtitle="Manage company operations members, configure multi-role permissions (e.g. SDE + Sales), and provision system access."
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
              <span>User management restricted to Admin / Founder</span>
            </div>
          )
        }
      />

      {/* Loading & Grid of Team Members */}
      {loadingUsers ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading verified team members from Appwrite...
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
          No team members registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((u) => {
            const userRoles = (u.roles && u.roles.length > 0 ? u.roles : [u.role]) as UserRole[];
            const activeTasks = u.active_tasks_count || 0;
            const openBugs = u.open_bugs_count || 0;
            const workloadScore = Math.min(Math.round(activeTasks * 12 + openBugs * 15), 100);
            const isOverloaded = workloadScore > 75;
            const isPrimaryAdmin = u.email.toLowerCase() === "contact@repsi.app";

            return (
              <div
                key={u.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Profile Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-extrabold text-slate-950 flex items-center justify-center text-sm shadow-md shrink-0">
                        {(u.name && u.name[0]) || (u.email && u.email[0].toUpperCase()) || "U"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{u.name || u.email}</h3>
                        <div className="text-[11px] text-slate-400 truncate">{u.department || "Operations"}</div>
                      </div>
                    </div>

                    {/* Admin Action Buttons: Edit and Delete */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit member details and roles"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {!isPrimaryAdmin && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="Remove member from system"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Assigned Roles Pills (One user can have multiple roles) */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {userRoles.map((r) => {
                      const matched = ALL_ROLES.find((ar) => ar.role === r);
                      const colorClass = matched ? matched.color : "bg-slate-800 text-slate-300 border-slate-700";
                      return (
                        <span
                          key={r}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}
                        >
                          {ROLE_LABELS[r] || r}
                        </span>
                      );
                    })}
                  </div>

                  {/* Operational Load Indicator */}
                  <div className="space-y-1.5 pt-3 mt-3 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Operational Load</span>
                      <span className="font-mono font-bold text-white">{workloadScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
                </div>

                {/* Email & Contact Footer */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span className="truncate">{u.email}</span>
                  {u.phone && <span>{u.phone}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. Admin Add Team Member Modal (With Multi-Role Picker) */}
      {/* ======================================================== */}
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
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Arun Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Engineering / Sales"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Company Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@repsi.app"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tempPassword}
                    onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Multi-role selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-slate-300 font-semibold">
                    Assign Operational Roles * (Select all that apply)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {formData.roles.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  {ALL_ROLES.map((ar) => {
                    const isSelected = formData.roles.includes(ar.role);
                    return (
                      <button
                        type="button"
                        key={ar.role}
                        onClick={() => toggleAddRole(ar.role)}
                        className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500/50 text-white font-semibold"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="text-[11px]">{ar.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Example: You can assign both <strong>Software Engineer</strong> and <strong>Field Sales</strong> to the same user.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save & Provision User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. Admin Edit Team Member Modal */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Edit Team Member & Roles</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Account Email (Fixed)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Multi-role selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-slate-300 font-semibold">
                    Assigned Roles (Modify & toggle roles)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {editFormData.roles.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  {ALL_ROLES.map((ar) => {
                    const isSelected = editFormData.roles.includes(ar.role);
                    return (
                      <button
                        type="button"
                        key={ar.role}
                        onClick={() => toggleEditRole(ar.role)}
                        className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-500/50 text-white font-semibold"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="text-[11px]">{ar.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. Admin Delete Confirmation Modal */}
      {/* ======================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Remove Team Member?</span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong>{deletingUser.name}</strong> (<code>{deletingUser.email}</code>)?
            </p>
            <p className="text-[11px] text-slate-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              This action will delete their user account in Appwrite Auth and revoke all operational platform access.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isSubmitting ? "Removing..." : "Yes, Remove User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
