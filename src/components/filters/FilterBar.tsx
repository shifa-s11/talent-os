"use client";

import { Download, LayoutGrid, List, Rows3, Rows2, Rows4, Tag, X } from "lucide-react";
import { usePipelineStore } from "@/store/usePipelineStore";
import {
  cn,
  STAGES,
  TAG_COLORS,
  countActiveFilters,
  filterCandidates,
} from "@/lib/utils";
import type { CandidateTag, DensityMode, Stage } from "@/types";
import { exportCandidatesCSV } from "@/lib/export";
import { useToast } from "@/components/ui/Toast";

const TAG_OPTIONS: CandidateTag[] = [
  "Referral",
  "Immediate Joiner",
  "Notice Period",
  "Design System Fit",
  "Ex-FAANG",
  "Open Source",
  "Requires Relocation",
  "Negotiating",
];

const STAGE_PILL_ACTIVE: Record<Stage, string> = {
  Applied: "border-blue-500/50 text-blue-300 bg-blue-500/10",
  Shortlisted: "border-violet-500/50 text-violet-300 bg-violet-500/10",
  Interview: "border-amber-500/50 text-amber-300 bg-amber-500/10",
  Offered: "border-cyan-500/50 text-cyan-300 bg-cyan-500/10",
  Hired: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
};

const SELECT_CLS =
  "text-xs bg-[#1a2236] border border-white/[0.08] text-slate-300 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-white/[0.18] hover:text-white transition-all duration-200 appearance-none";

const DENSITY_OPTIONS: { value: DensityMode; icon: React.ElementType; label: string }[] = [
  { value: "compact", icon: Rows2, label: "Compact density" },
  { value: "comfortable", icon: Rows3, label: "Comfortable density" },
  { value: "spacious", icon: Rows4, label: "Spacious density" },
];

export function FilterBar() {
  const {
    viewMode,
    setViewMode,
    filters,
    setFilters,
    clearFilters,
    density,
    setDensity,
    candidates,
  } = usePipelineStore();
  const { showToast } = useToast();

  const activeCount = countActiveFilters(filters);
  const filteredCandidates = filterCandidates(candidates, filters);

  const toggleStage = (stage: Stage) =>
    setFilters({
      stages: filters.stages.includes(stage)
        ? filters.stages.filter((item) => item !== stage)
        : [...filters.stages, stage],
    });

  const toggleTag = (tag: CandidateTag) =>
    setFilters({
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((item) => item !== tag)
        : [...filters.tags, tag],
    });

  return (
    <div className="bg-[#0c0f1a] border-b border-white/[0.06] px-4 sm:px-5 py-2 flex-shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {STAGES.map((stage) => {
            const isActive = filters.stages.includes(stage);
            return (
              <button
                key={stage}
                onClick={() => toggleStage(stage)}
                className={cn(
                  "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all duration-200 active:scale-[0.98]",
                  isActive
                    ? STAGE_PILL_ACTIVE[stage]
                    : "border-white/[0.08] text-slate-500 hover:border-white/[0.18] hover:text-white focus-visible:border-white/[0.18] focus-visible:text-white",
                )}
              >
                {stage}
              </button>
            );
          })}

          <details className="relative">
            <summary className="list-none inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-slate-300 cursor-pointer transition-all duration-200 hover:border-white/[0.16] hover:text-white focus-visible:border-white/[0.16] focus-visible:text-white">
              <Tag size={12} />
              Tags
            </summary>
            <div className="absolute left-0 top-8 z-30 min-w-[220px] rounded-xl border border-white/[0.08] bg-[#111827] p-3 shadow-xl shadow-black/40 animate-scaleIn">
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200 active:scale-[0.98]",
                      TAG_COLORS[tag],
                      filters.tags.includes(tag) ? "ring-1 ring-white/20" : "opacity-80",
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>

        <div className="flex-1 min-w-0" />

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.experienceBracket}
            onChange={(event) => setFilters({ experienceBracket: event.target.value as typeof filters.experienceBracket })}
            className={SELECT_CLS}
          >
            <option value="Any">Exp: Any</option>
            <option value="0-2">0-2 yrs</option>
            <option value="3-5">3-5 yrs</option>
            <option value="5-8">5-8 yrs</option>
            <option value="8+">8+ yrs</option>
          </select>

          <select
            value={filters.scoreRange}
            onChange={(event) => setFilters({ scoreRange: event.target.value as typeof filters.scoreRange })}
            className={SELECT_CLS}
          >
            <option value="Any">Score: Any</option>
            <option value="80-100">80-100</option>
            <option value="60-79">60-79</option>
            <option value="below-60">Below 60</option>
          </select>

          <button
            onClick={() => {
              exportCandidatesCSV(filteredCandidates);
              showToast({ message: `Exported ${filteredCandidates.length} candidates`, type: "info" });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#1a2236] px-3 py-1.5 text-xs text-slate-300 transition-all duration-200 hover:border-white/[0.16] hover:text-white focus-visible:border-white/[0.16] focus-visible:text-white active:scale-[0.98]"
          >
            <Download size={13} />
            Export
          </button>

          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#1a2236] p-1">
            {DENSITY_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setDensity(value)}
                aria-label={label}
                className={cn(
                  "rounded-md p-1.5 transition-all duration-200 active:scale-[0.98]",
                  density === value
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-slate-500 hover:text-white focus-visible:text-white hover:bg-white/[0.06] focus-visible:bg-white/[0.06]",
                )}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white focus-visible:text-white border border-white/[0.08] hover:border-white/[0.18] focus-visible:border-white/[0.18] rounded-lg px-2.5 py-1.5 transition-all duration-200 active:scale-[0.98]"
            >
              <X size={11} />
              Clear
              <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                {activeCount}
              </span>
            </button>
          )}

          <div className="flex items-center gap-0.5 bg-[#1a2236] border border-white/[0.08] rounded-lg p-0.5 flex-shrink-0">
            {(["board", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={`${mode === "board" ? "Board" : "List"} view`}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200 active:scale-[0.98]",
                  viewMode === mode
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "text-slate-600 hover:text-slate-300 focus-visible:text-slate-300",
                )}
              >
                {mode === "board" ? <LayoutGrid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
