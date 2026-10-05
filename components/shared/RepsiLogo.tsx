import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface RepsiLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showDomain?: boolean;
}

export function RepsiLogo({ className, size = "md", showDomain = false }: RepsiLogoProps) {
  const imageHeights = {
    sm: "h-6 w-auto",
    md: "h-7 w-auto",
    lg: "h-10 w-auto",
  };

  const badgeSizes = {
    sm: "text-[9px] px-1.5 py-0.5",
    md: "text-[10px] px-2 py-0.5",
    lg: "text-xs px-2.5 py-1",
  };

  return (
    <Link href="/dashboard" className={cn("inline-flex items-center gap-2.5 group select-none", className)}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {/* Official REPSI Wordmark Logo */}
          <div className="relative flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dark_logo_trans.png"
              alt="REPSI"
              className={cn("object-contain transition-opacity group-hover:opacity-90", imageHeights[size])}
            />
          </div>

          {/* OPS Badge */}
          <span
            className={cn(
              "font-bold uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm",
              badgeSizes[size]
            )}
          >
            OPS
          </span>
        </div>

        {showDomain && (
          <span className="text-[11px] text-slate-400 font-mono mt-1 tracking-tight pl-0.5">
            ops.repsi.app
          </span>
        )}
      </div>
    </Link>
  );
}
