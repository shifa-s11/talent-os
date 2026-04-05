"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Candidate, Stage } from "@/types";
import { usePipelineStore } from "@/store/usePipelineStore";
import { CandidateCard } from "./CandidateCard";
import { cn, STAGE_CONFIG } from "@/lib/utils";
import { StageEmptyState } from "./StageEmptyState";

interface Props {
  stage: Stage;
  candidates: Candidate[];
}

export function StageColumn({ stage, candidates }: Props) {
  const { moveCandidate, openNewCandidateModal } = usePipelineStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const config = STAGE_CONFIG[stage];

  const onDragStart = (event: React.DragEvent, candidate: Candidate) => {
    event.dataTransfer.setData("candidateId", candidate.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const id = event.dataTransfer.getData("candidateId");
    if (id) moveCandidate(id, stage);
  };

  return (
    <div className="flex-shrink-0 w-[272px] flex flex-col max-h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", config.dot)} />
        <span className="text-[13px] font-semibold text-slate-200 flex-1">{stage}</span>
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
            config.bg,
            config.text,
            config.border,
          )}
          aria-live="polite"
        >
          {candidates.length}
        </span>
        <button
          onClick={() => openNewCandidateModal(stage)}
          className="p-1 rounded-md text-slate-700 hover:text-slate-300 focus-visible:text-slate-300 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] transition-all duration-200"
          title={`Add to ${stage}`}
          aria-label={`Add candidate to ${stage}`}
        >
          <Plus size={13} />
        </button>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex-1 overflow-y-auto space-y-2.5 rounded-xl p-2 border-2 transition-all duration-200 min-h-[80px]",
          isDragOver
            ? "border-dashed border-indigo-500/40 bg-indigo-500/[0.03]"
            : "border-transparent",
        )}
      >
        {candidates.length === 0 ? (
          <StageEmptyState stage={stage} />
        ) : (
          candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
