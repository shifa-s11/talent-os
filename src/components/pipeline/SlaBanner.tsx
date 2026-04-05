"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { usePipelineStore } from "@/store/usePipelineStore";
import { daysInStage } from "@/lib/utils";

export function SlaBanner() {
  const { candidates, clearFilters } = usePipelineStore();
  const [dismissed, setDismissed] = useState(false);

  const staleCount = useMemo(
    () => candidates.filter((candidate) => daysInStage(candidate) >= 5).length,
    [candidates],
  );

  if (dismissed || staleCount === 0) return null;

  return (
    <div className="mx-4 mt-1 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200 animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{staleCount} candidates idle &gt;5 days across pipeline</span>
          <button
            onClick={() => clearFilters()}
            className="text-amber-100 underline underline-offset-2 transition-all duration-200 hover:text-white focus-visible:text-white"
          >
            View all
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss SLA banner"
          className="rounded-md p-1 text-amber-200 transition-all duration-200 hover:bg-amber-500/10 hover:text-white focus-visible:bg-amber-500/10 focus-visible:text-white active:scale-[0.98]"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
