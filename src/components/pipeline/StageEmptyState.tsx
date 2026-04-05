"use client";

import { UserPlus } from "lucide-react";
import type { Stage } from "@/types";
import { usePipelineStore } from "@/store/usePipelineStore";
import { hasActiveFilters as computeHasActiveFilters } from "@/lib/utils";

export function StageEmptyState({ stage }: { stage: Stage }) {
  const { filters, clearFilters, openNewCandidateModal } = usePipelineStore();
  const hasActiveFilters = computeHasActiveFilters(filters);

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/[0.08] py-10 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
        <UserPlus size={16} className="text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-300">No candidates</p>
      <p className="text-xs text-slate-500">in {stage}</p>
      {hasActiveFilters ? (
        <button
          onClick={clearFilters}
          className="mt-1 text-xs font-medium text-indigo-400 transition-all duration-200 hover:text-indigo-300 focus-visible:text-indigo-300"
        >
          Clear filters
        </button>
      ) : (
        <button
          onClick={() => openNewCandidateModal(stage)}
          className="mt-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white focus-visible:border-white/[0.16] focus-visible:bg-white/[0.08] focus-visible:text-white active:scale-[0.98]"
        >
          + Add to {stage}
        </button>
      )}
    </div>
  );
}
