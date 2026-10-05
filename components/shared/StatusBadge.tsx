import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/[\s-]/g, "_");

  // Determine color theme based on semantic status
  const getStyles = () => {
    switch (normalized) {
      // Success / Won / Done / Closed
      case "WON":
      case "COMPLETED":
      case "DONE":
      case "CLOSED":
      case "RELEASED":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

      // In Progress / Active / Development
      case "IN_PROGRESS":
      case "DEVELOPMENT":
      case "TRIAL":
      case "VISITED":
      case "DEMO_COMPLETED":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";

      // Testing / QA / Review
      case "QA":
      case "QA_TESTING":
      case "QA_VERIFICATION":
      case "IN_REVIEW":
      case "CODE_REVIEW":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";

      // Warning / Negotiation / Scheduled
      case "NEGOTIATION":
      case "DEMO_SCHEDULED":
      case "VISIT_PLANNED":
      case "SCHEDULED":
      case "DESIGN":
      case "ASSIGNED":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";

      // Danger / Blocked / Lost
      case "BLOCKED":
      case "LOST":
      case "CANCELLED":
      case "REOPENED":
      case "NOT_INTERESTED":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";

      // Neutral / Backlog / Todo / Planned
      case "TODO":
      case "PLANNED":
      case "BACKLOG":
      case "PROSPECT":
      case "CONTACTED":
      case "REPORTED":
      case "ON_HOLD":
      default:
        return "bg-slate-700/30 text-slate-300 border-slate-600/40";
    }
  };

  const formattedText = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full tracking-wide transition-colors",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        getStyles(),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {formattedText}
    </span>
  );
}
