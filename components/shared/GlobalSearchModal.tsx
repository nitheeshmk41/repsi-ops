"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  CheckSquare,
  Bug as BugIcon,
  Layers,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";
import { opsStore } from "@/lib/services/ops-store";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = opsStore.search(query);
  const hasResults =
    results.gyms.length > 0 ||
    results.tasks.length > 0 ||
    results.bugs.length > 0 ||
    results.modules.length > 0 ||
    results.featureRequests.length > 0;

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-emerald-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gyms, owners, tasks, bug IDs (e.g. BUG-1042), modules..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-slate-800 rounded text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-4 space-y-6">
          {!query && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p className="font-medium text-slate-300">Quick Search across Repsi Ops</p>
              <p className="text-xs text-slate-500 mt-1">
                Type gym name like <span className="text-emerald-400">ABC Fitness</span>, a bug ID like{" "}
                <span className="text-emerald-400">BUG-1042</span>, or module like{" "}
                <span className="text-emerald-400">Attendance</span>
              </p>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-10 text-slate-400 text-sm">
              No matching records found for &ldquo;<span className="text-white">{query}</span>&rdquo;
            </div>
          )}

          {/* Group 1: Gyms & Leads */}
          {results.gyms.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                <Building2 className="w-3.5 h-3.5" />
                Gyms & Fitness Businesses ({results.gyms.length})
              </div>
              <div className="space-y-1">
                {results.gyms.map((gym) => (
                  <button
                    key={gym.id}
                    onClick={() => handleNavigate(`/crm/gyms/${gym.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-emerald-300">
                        {gym.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Owner: {gym.owner_name} • {gym.area}, {gym.city} • Stage: {gym.stage}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                <CheckSquare className="w-3.5 h-3.5" />
                Tasks ({results.tasks.length})
              </div>
              <div className="space-y-1">
                {results.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleNavigate(`/project/tasks`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-cyan-300">
                        {task.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        Module: {task.module_name} • Assignee: {task.assignee_name} • Status: {task.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Bugs */}
          {results.bugs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400 mb-2">
                <BugIcon className="w-3.5 h-3.5" />
                Bugs ({results.bugs.length})
              </div>
              <div className="space-y-1">
                {results.bugs.map((bug) => (
                  <button
                    key={bug.id}
                    onClick={() => handleNavigate(`/bugs/${bug.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-rose-300">
                        <span className="font-mono text-rose-400 font-bold mr-2">{bug.bug_id}</span>
                        {bug.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        Severity: {bug.severity} • Priority: {bug.priority} • Module: {bug.module_name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Modules */}
          {results.modules.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">
                <Layers className="w-3.5 h-3.5" />
                Modules ({results.modules.length})
              </div>
              <div className="space-y-1">
                {results.modules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleNavigate(`/product/modules/${mod.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-purple-300">
                        {mod.name} ({mod.code})
                      </div>
                      <div className="text-xs text-slate-400">
                        Progress: {mod.progress_percent}% • Status: {mod.status} • Owner: {mod.owner_name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group 5: Feature Requests */}
          {results.featureRequests.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Feature Requests ({results.featureRequests.length})
              </div>
              <div className="space-y-1">
                {results.featureRequests.map((fr) => (
                  <button
                    key={fr.id}
                    onClick={() => handleNavigate(`/product/feature-requests`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-amber-300">
                        <span className="font-mono text-amber-400 font-bold mr-2">{fr.request_code}</span>
                        {fr.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        Gym: {fr.gym_name || "General"} • Status: {fr.status} • Customers: {fr.customers_count}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Tip: Navigation takes you directly to the record</span>
          <div className="flex items-center gap-3">
            <span>Press <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">ESC</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
