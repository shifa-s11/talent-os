"use client";

import { ArrowRight, ChevronDown, Download, Users, X, XCircle } from "lucide-react";
import { useState } from "react";
import { usePipelineStore } from "@/store/usePipelineStore";
import { cn, STAGES, STAGE_CONFIG } from "@/lib/utils";
import type { Stage } from "@/types";
import { exportCandidatesCSV } from "@/lib/export";
import { useToast } from "@/components/ui/Toast";

export function BulkActionBar() {
  const {
    selectedIds,
    clearSelection,
    bulkMove,
    candidates,
    rejectCandidate,
    restoreSnapshot,
  } = usePipelineStore();
  const { showToast } = useToast();
  const [stageOpen, setStageOpen] = useState(false);

  const count = selectedIds.size;
  if (count === 0) return null;

  const selectedCandidates = candidates.filter((candidate) => selectedIds.has(candidate.id));

  const handleBulkMove = (stage: Stage) => {
    bulkMove(stage);
    setStageOpen(false);
    showToast({
      message: `${selectedCandidates.length} candidates moved to ${stage}`,
      type: "success",
      undoAction: restoreSnapshot,
    });
  };

  const handleExport = () => {
    exportCandidatesCSV(selectedCandidates);
    showToast({
      message: `Exported ${selectedCandidates.length} candidates as CSV`,
      type: "info",
    });
  };

  const handleBulkReject = () => {
    selectedCandidates.forEach((candidate) => rejectCandidate(candidate.id));
    clearSelection();
    showToast({
      message: `${selectedCandidates.length} candidates rejected`,
      type: "warning",
      undoAction: restoreSnapshot,
    });
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-slideInUp">
      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-[#1e2a40] px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2 border-r border-white/[0.1] pr-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20">
            <Users size={12} className="text-indigo-300" />
          </div>
          <span className="whitespace-nowrap text-sm font-semibold text-white">{count} selected</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setStageOpen((value) => !value)}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.1] hover:text-white focus-visible:bg-white/[0.1] focus-visible:text-white active:scale-[0.98]"
          >
            <ArrowRight size={13} />
            Move stage
            <ChevronDown size={11} className={cn("transition-transform duration-200", stageOpen && "rotate-180")} />
          </button>
          {stageOpen && (
            <div className="absolute bottom-full left-0 z-10 mb-2 min-w-[152px] rounded-xl border border-white/[0.1] bg-[#1e2a40] py-1.5 shadow-2xl shadow-black/60 animate-scaleIn">
              <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Move all to</p>
              {STAGES.map((stage) => {
                const config = STAGE_CONFIG[stage];
                return (
                  <button
                    key={stage}
                    onClick={() => handleBulkMove(stage)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-slate-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white"
                  >
                    <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                    {stage}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.1] hover:text-white focus-visible:bg-white/[0.1] focus-visible:text-white active:scale-[0.98]"
        >
          <Download size={13} />
          Export
        </button>

        <button
          onClick={handleBulkReject}
          className="flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/[0.08] px-3 py-1.5 text-[12px] font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/[0.14] hover:text-rose-200 focus-visible:bg-rose-500/[0.14] focus-visible:text-rose-200 active:scale-[0.98]"
        >
          <XCircle size={13} />
          Reject
        </button>

        <div className="h-5 w-px bg-white/[0.1]" />

        <button
          onClick={clearSelection}
          aria-label="Clear selection"
          className="rounded-lg p-1.5 text-slate-500 transition-all duration-200 hover:bg-white/[0.08] hover:text-white focus-visible:bg-white/[0.08] focus-visible:text-white active:scale-[0.98]"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
