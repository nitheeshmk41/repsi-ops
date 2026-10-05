import React from "react";
import { cn } from "@/lib/utils";
import { Priority, BugSeverity } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const configs: Record<Priority, { label: string; style: string }> = {
    P0: { label: "P0 Immediate", style: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
    P1: { label: "P1 Very High", style: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
    P2: { label: "P2 Normal", style: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
    P3: { label: "P3 Low", style: "bg-slate-700/30 text-slate-400 border-slate-600/30" },
  };

  const config = configs[priority] || configs.P2;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border tracking-tight",
        config.style,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: BugSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const configs: Record<BugSeverity, { label: string; style: string; icon: string }> = {
    CRITICAL: { label: "Critical", style: "bg-red-500/20 text-red-300 border-red-500/50", icon: "🔴" },
    MAJOR: { label: "Major", style: "bg-amber-500/20 text-amber-300 border-amber-500/50", icon: "🟠" },
    MINOR: { label: "Minor", style: "bg-sky-500/20 text-sky-300 border-sky-500/40", icon: "🔵" },
    COSMETIC: { label: "Cosmetic", style: "bg-slate-700/30 text-slate-300 border-slate-600/40", icon: "⚪" },
  };

  const config = configs[severity] || configs.MINOR;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border",
        config.style,
        className
      )}
    >
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  );
}
