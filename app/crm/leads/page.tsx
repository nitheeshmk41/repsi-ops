"use client";

import React, { useState } from "react";
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
  X,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { opsStore } from "@/lib/services/ops-store";
import { Gym, BusinessType, PipelineStage } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LeadsPage() {
  const [gyms, setGyms] = useState<Gym[]>(opsStore.getGyms());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
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

    const created = opsStore.createGym({
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Gym Lead
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
                  <th className="px-5 py-3.5 text-right">Actions</th>
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

                    {/* Quick Link Action */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/crm/gyms/${g.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-xs"
                      >
                        Profile
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

      {/* Add New Gym Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Create New Gym / Lead</h3>
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
    </AppLayout>
  );
}
