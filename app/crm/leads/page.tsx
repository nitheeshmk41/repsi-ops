"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  Filter,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  CalendarPlus,
  Calendar,
  Clock,
  Edit2,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { opsStore } from "@/lib/services/ops-store";
import { Gym, BusinessType, PipelineStage } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LeadsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStage, setFilterStage] = useState<string>("ALL");

  useEffect(() => {
    opsStore.ensureHydrated();
    setGyms([...opsStore.getGyms()]);
    const unsubscribe = opsStore.subscribe(() => {
      setGyms([...opsStore.getGyms()]);
    });
    return unsubscribe;
  }, []);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Selected Gym for edit / follow-up / schedule
  const [editingGym, setEditingGym] = useState<Gym | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    area: "",
    city: "Coimbatore",
    address: "",
    business_type: "Gym" as BusinessType,
    members_count: 150,
    current_software: "Excel Sheets",
    current_payment_system: "GPay QR / Cash",
    expected_revenue: 35000,
    stage: "PROSPECT" as PipelineStage,
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    id: "",
    name: "",
    owner_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    area: "",
    city: "Coimbatore",
    address: "",
    business_type: "Gym" as BusinessType,
    members_count: 150,
    current_software: "Excel Sheets",
    current_payment_system: "GPay QR / Cash",
    expected_revenue: 35000,
    stage: "PROSPECT" as PipelineStage,
  });

  // Follow-up Form State
  const [followUpData, setFollowUpData] = useState({
    gym_id: "",
    contact_name: "",
    due_date: new Date().toISOString().split("T")[0],
    type: "WHATSAPP" as const,
    notes: "",
  });

  // Schedule Visit Form State
  const [scheduleData, setScheduleData] = useState({
    gym_id: "",
    time_slot: "11:00 AM",
    scheduled_at: new Date().toISOString().split("T")[0],
  });

  const filteredGyms = gyms.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      g.area.toLowerCase().includes(search.toLowerCase()) ||
      g.city.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "ALL" || g.business_type === filterType;
    const matchesStage = filterStage === "ALL" || g.stage === filterStage;

    return matchesSearch && matchesType && matchesStage;
  });

  const handleCreateGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.owner_name || !formData.phone) {
      alert("Please fill in Gym Name, Owner Name, and Phone number.");
      return;
    }

    opsStore.createGym({
      ...formData,
      assigned_salesperson_id: "usr_sales_1",
      assigned_salesperson_name: "Arun Sales (Salesperson A)",
    });

    setGyms([...opsStore.getGyms()]);
    setIsModalOpen(false);
    setFormData({
      name: "",
      owner_name: "",
      phone: "",
      whatsapp: "",
      email: "",
      area: "",
      city: "Coimbatore",
      address: "",
      business_type: "Gym",
      members_count: 150,
      current_software: "Excel Sheets",
      current_payment_system: "GPay QR / Cash",
      expected_revenue: 35000,
      stage: "PROSPECT",
    });
  };

  const handleOpenEdit = (gym: Gym) => {
    setEditingGym(gym);
    setEditFormData({
      id: gym.id,
      name: gym.name,
      owner_name: gym.owner_name,
      phone: gym.phone,
      whatsapp: gym.whatsapp || gym.phone,
      email: gym.email || "",
      area: gym.area,
      city: gym.city,
      address: gym.address || "",
      business_type: gym.business_type,
      members_count: gym.members_count || 150,
      current_software: gym.current_software || "Excel Sheets",
      current_payment_system: gym.current_payment_system || "GPay QR / Cash",
      expected_revenue: gym.expected_revenue || 35000,
      stage: gym.stage,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id || !editFormData.name || !editFormData.owner_name) {
      alert("Please fill in Gym Name and Owner Name.");
      return;
    }

    opsStore.updateGym(editFormData.id, {
      name: editFormData.name,
      owner_name: editFormData.owner_name,
      phone: editFormData.phone,
      whatsapp: editFormData.whatsapp,
      email: editFormData.email,
      area: editFormData.area,
      city: editFormData.city,
      address: editFormData.address,
      business_type: editFormData.business_type,
      members_count: editFormData.members_count,
      current_software: editFormData.current_software,
      current_payment_system: editFormData.current_payment_system,
      expected_revenue: editFormData.expected_revenue,
      stage: editFormData.stage,
    });

    setGyms([...opsStore.getGyms()]);
    setIsEditModalOpen(false);
    setEditingGym(null);
  };

  const handleOpenFollowUp = (gym?: Gym) => {
    const targetId = gym?.id || gyms[0]?.id || "";
    const targetGym = gym || gyms.find((g) => g.id === targetId);
    setFollowUpData({
      gym_id: targetId,
      contact_name: targetGym?.owner_name || "",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      type: "WHATSAPP",
      notes: targetGym ? `Follow-up with ${targetGym.owner_name} regarding quotation and features demo` : "",
    });
    setIsFollowUpModalOpen(true);
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const gym = gyms.find((g) => g.id === followUpData.gym_id);
    if (!gym) return;

    opsStore.createFollowUp({
      gym_id: gym.id,
      gym_name: gym.name,
      contact_name: followUpData.contact_name || gym.owner_name,
      due_date: followUpData.due_date,
      assigned_to_id: "usr_sales_1",
      assigned_to_name: "Arun Sales (Salesperson A)",
      type: followUpData.type,
      status: "PENDING",
      notes: followUpData.notes,
    });

    setIsFollowUpModalOpen(false);
    alert(`Follow-up scheduled for ${gym.name}!`);
  };

  const handleOpenSchedule = (gym?: Gym) => {
    const targetId = gym?.id || gyms[0]?.id || "";
    setScheduleData({
      gym_id: targetId,
      time_slot: "11:00 AM",
      scheduled_at: new Date().toISOString().split("T")[0],
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
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

    setGyms([...opsStore.getGyms()]);
    setIsScheduleModalOpen(false);
    alert(`Visit scheduled for ${gym.name} at ${scheduleData.time_slot}!`);
  };

  const businessTypes: BusinessType[] = [
    "Gym",
    "Fitness Studio",
    "CrossFit",
    "Yoga",
    "Personal Training",
    "Martial Arts",
    "Sports Academy",
    "Wellness Center",
    "Multi-branch",
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Fitness CRM & Leads"
        subtitle="Manage gym leads, fitness centers, and owner contacts across sales territories."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenFollowUp()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Follow-ups
            </button>

            <button
              onClick={() => handleOpenSchedule()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Schedule
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Gym Lead
            </button>
          </div>
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
            placeholder="Search gym by name, owner, area, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Business Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Business Types</option>
            {businessTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Pipeline Stages</option>
            <option value="PROSPECT">Prospect</option>
            <option value="VISIT_PLANNED">Visit Planned</option>
            <option value="VISITED">Visited</option>
            <option value="DEMO_COMPLETED">Demo Completed</option>
            <option value="TRIAL">Trial</option>
            <option value="WON">Won / Customer</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {filteredGyms.length === 0 ? (
        <EmptyState
          title="No Gyms Found"
          description="Try modifying your search or filter, or add a new fitness business lead."
          actionLabel="Create Gym Lead"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Gym / Fitness Center</th>
                  <th className="px-5 py-3.5">Owner & Contact</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Members</th>
                  <th className="px-5 py-3.5">Current Software</th>
                  <th className="px-5 py-3.5">Pipeline Stage</th>
                  <th className="px-5 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGyms.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Gym Name & Type */}
                    <td className="px-5 py-4 font-medium text-white">
                      <Link
                        href={`/crm/gyms/${g.id}`}
                        className="hover:text-emerald-400 font-semibold text-sm transition-colors block"
                      >
                        {g.name}
                      </Link>
                      <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 font-medium">
                        {g.business_type}
                      </span>
                    </td>

                    {/* Owner & Phone */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">{g.owner_name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {g.phone}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{g.area}, {g.city}</span>
                      </div>
                    </td>

                    {/* Members & Size */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{g.members_count || "N/A"}</div>
                      <div className="text-[10px] text-slate-500">{g.business_size || "Medium"}</div>
                    </td>

                    {/* Current Software */}
                    <td className="px-5 py-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                        {g.current_software || "None"}
                      </span>
                    </td>

                    {/* Stage Badge */}
                    <td className="px-5 py-4">
                      <StatusBadge status={g.stage} />
                    </td>

                    {/* Quick Action Buttons (Follow-up, Schedule, Edit, Profile) */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenFollowUp(g)}
                          title="Schedule Follow-up"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors text-xs font-medium"
                        >
                          <Clock className="w-3 h-3 text-amber-400" />
                          Follow-up
                        </button>

                        <button
                          onClick={() => handleOpenSchedule(g)}
                          title="Schedule Visit"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-colors text-xs font-medium"
                        >
                          <Calendar className="w-3 h-3 text-sky-400" />
                          Schedule
                        </button>

                        <button
                          onClick={() => handleOpenEdit(g)}
                          title="Edit Lead Changes"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors text-xs font-medium"
                        >
                          <Edit2 className="w-3 h-3 text-emerald-400" />
                          Edit
                        </button>

                        <Link
                          href={`/crm/gyms/${g.id}`}
                          title="View Full Profile"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs"
                        >
                          Profile
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Gym Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Create New Gym Lead</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter fitness business and owner details for field sales engagement
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGym} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Gym Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. IronWorks Gym"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Owner Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="e.g. Rajesh Kannan"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Phone Number *</label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98400 12345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+91 98400 12345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Business Type</label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value as BusinessType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {businessTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Active Members (Approx)</label>
                  <input
                    type="number"
                    value={formData.members_count}
                    onChange={(e) => setFormData({ ...formData, members_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Area / Neighborhood</label>
                  <input
                    required
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="e.g. RS Puram / Peelamedu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Current Software</label>
                  <input
                    type="text"
                    value={formData.current_software}
                    onChange={(e) => setFormData({ ...formData, current_software: e.target.value })}
                    placeholder="Excel / Legacy Desktop"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Expected Annual Revenue (INR)</label>
                  <input
                    type="number"
                    value={formData.expected_revenue}
                    onChange={(e) => setFormData({ ...formData, expected_revenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Gym Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-400" />
                  Edit Lead Details: {editFormData.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update contact, location, business size, and pipeline status
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Gym Name *</label>
                  <input
                    required
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Owner Name *</label>
                  <input
                    required
                    type="text"
                    value={editFormData.owner_name}
                    onChange={(e) => setEditFormData({ ...editFormData, owner_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Phone Number *</label>
                  <input
                    required
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">WhatsApp</label>
                  <input
                    type="text"
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="owner@gym.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Pipeline Stage</label>
                  <select
                    value={editFormData.stage}
                    onChange={(e) => setEditFormData({ ...editFormData, stage: e.target.value as PipelineStage })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="PROSPECT">Prospect</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="VISIT_PLANNED">Visit Planned</option>
                    <option value="VISITED">Visited</option>
                    <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                    <option value="DEMO_COMPLETED">Demo Completed</option>
                    <option value="TRIAL">Trial</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won / Customer</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Business Type</label>
                  <select
                    value={editFormData.business_type}
                    onChange={(e) => setEditFormData({ ...editFormData, business_type: e.target.value as BusinessType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {businessTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Active Members</label>
                  <input
                    type="number"
                    value={editFormData.members_count}
                    onChange={(e) => setEditFormData({ ...editFormData, members_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Area</label>
                  <input
                    required
                    type="text"
                    value={editFormData.area}
                    onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Current Software</label>
                  <input
                    type="text"
                    value={editFormData.current_software}
                    onChange={(e) => setEditFormData({ ...editFormData, current_software: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Expected Annual Revenue (INR)</label>
                  <input
                    type="number"
                    value={editFormData.expected_revenue}
                    onChange={(e) => setEditFormData({ ...editFormData, expected_revenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {isFollowUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleSaveFollowUp} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Schedule Follow-up Task
              </h3>
              <button type="button" onClick={() => setIsFollowUpModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Target Gym / Lead *</label>
              <select
                value={followUpData.gym_id}
                onChange={(e) => {
                  const selected = gyms.find((g) => g.id === e.target.value);
                  setFollowUpData({
                    ...followUpData,
                    gym_id: e.target.value,
                    contact_name: selected?.owner_name || "",
                  });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              >
                {gyms.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.owner_name} - {g.area})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Follow-up Type</label>
                <select
                  value={followUpData.type}
                  onChange={(e) => setFollowUpData({ ...followUpData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="CALL">Phone Call</option>
                  <option value="VISIT">In-person Visit</option>
                  <option value="DEMO">Product Demo</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Due Date *</label>
                <input
                  required
                  type="date"
                  value={followUpData.due_date}
                  onChange={(e) => setFollowUpData({ ...followUpData, due_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Follow-up Notes / Goal *</label>
              <textarea
                required
                rows={3}
                value={followUpData.notes}
                onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })}
                placeholder="e.g. Call gym owner to check on software quote and offer 1-month trial..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setIsFollowUpModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl shadow-md">
                Create Follow-up
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <form onSubmit={handleSaveSchedule} className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Schedule Field Visit
              </h3>
              <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Select Gym / Lead *</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Time Slot *</label>
                <input
                  required
                  type="text"
                  value={scheduleData.time_slot}
                  onChange={(e) => setScheduleData({ ...scheduleData, time_slot: e.target.value })}
                  placeholder="e.g. 10:30 AM"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Date *</label>
                <input
                  required
                  type="date"
                  value={scheduleData.scheduled_at}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl shadow-md">
                Schedule Visit
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
