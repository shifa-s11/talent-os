"use client";

import { usePipelineStore } from "@/store/usePipelineStore";
import { hasActiveFilters } from "@/lib/utils";

export function EmptySearchResults() {
  const { filters, clearFilters } = usePipelineStore();
  const activeFilters = [
    ...filters.stages.map((stage) => `Stage: ${stage}`),
    filters.experienceBracket !== "Any" ? `Experience: ${filters.experienceBracket}` : null,
    filters.scoreRange !== "Any" ? `Score: ${filters.scoreRange}` : null,
  ].filter(Boolean) as string[];

  const queryLabel = filters.search.trim()
    ? `No candidates match "${filters.search.trim()}"`
    : "No candidates match the current filters";

  if (!hasActiveFilters(filters)) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 animate-fadeIn">
      <InlineSearchIllustration />
      <div className="text-center space-y-1">
        <p className="text-slate-300 font-semibold text-sm">{queryLabel}</p>
        <p className="text-slate-600 text-xs">
          Try adjusting your search or filter criteria.
        </p>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {activeFilters.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
      <button
        onClick={clearFilters}
        className="rounded-lg border border-indigo-500/30 bg-indigo-500/[0.06] px-4 py-2 text-sm text-indigo-400 transition-all duration-200 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-300 focus-visible:border-indigo-400/50 focus-visible:bg-indigo-500/10 focus-visible:text-indigo-300 active:scale-[0.98]"
      >
        Clear all filters
      </button>
    </div>
  );
}

function InlineSearchIllustration() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
      <circle cx="38" cy="38" r="22" stroke="#475569" strokeWidth="4" />
      <path d="M54 54L70 70" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      <path d="M31 31L45 45" stroke="#F87171" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 31L31 45" stroke="#F87171" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
