"use client";

import React from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Database,
  Server,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/lib/auth/context";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/auth/rbac";

export default function SettingsPage() {
  const { user, role } = useAuth();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <AppLayout>
      <PageHeader
        title="Settings & System Architecture"
        subtitle="Appwrite backend connectivity, TablesDB status, role permissions, and environment variables."
      />

      <div className="space-y-6 max-w-4xl">
        {/* User Identity & Active Role */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Authenticated Session & Role-Based Access
            </h3>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Session
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Current User:</span>
              <div className="font-semibold text-white text-sm mt-0.5">{user?.name}</div>
              <div className="text-slate-400 font-mono mt-0.5">{user?.email}</div>
            </div>

            <div>
              <span className="text-slate-400">Assigned Operational Role:</span>
              <div className="font-semibold text-emerald-400 text-sm mt-0.5">
                {ROLE_LABELS[role]} ({role})
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </div>
          </div>
        </div>

        {/* Backend & Appwrite Infrastructure Status */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Appwrite Cloud TablesDB
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TablesDB Active</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-medium">Appwrite Endpoint</span>
                <div className="font-mono text-slate-200 mt-0.5">{appwriteConfig.endpoint}</div>
              </div>
              <button
                onClick={() => copyToClipboard(appwriteConfig.endpoint)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-medium">Appwrite Project ID</span>
                <div className="font-mono text-slate-200 mt-0.5">{appwriteConfig.projectId}</div>
              </div>
              <button
                onClick={() => copyToClipboard(appwriteConfig.projectId)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-medium">Primary Database ID</span>
                <div className="font-mono text-emerald-400 mt-0.5">
                  {appwriteConfig.databaseId || "repsi_ops_db"} (TablesDB)
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                Appwrite Cloud
              </span>
            </div>
          </div>
        </div>

        {/* Deployment & Production Domain */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            Production Deployment Configuration
          </h3>
          <p className="text-slate-400 leading-relaxed">
            REPSI Ops is architected for zero/low-cost free-tier deployment on <strong>Vercel</strong> + <strong>Appwrite Cloud</strong>.
          </p>
          <div className="pt-2 flex items-center gap-4 text-slate-300 font-mono">
            <span>Primary Domain: <strong className="text-white">repsi-ops.vercel.app</strong></span>
            <span>•</span>
            <span>Stack: <strong className="text-emerald-400">Next.js 16 + React 19 + Appwrite</strong></span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
