"use client";

import { useState } from "react";
import { ArrowRight, Calendar, Clock, Eye, MoreHorizontal, XCircle } from "lucide-react";
import type { Candidate } from "@/types";
import { usePipelineStore } from "@/store/usePipelineStore";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { TAG_COLORS, cn, daysInStage, expLabel, formatRelativeTime, scoreBar, STAGES, STAGE_CONFIG } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STATUS = {
  Active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
  "On Hold": "bg-amber-500/15 text-amber-300 border border-amber-500/20",
  Rejected: "bg-rose-500/15 text-rose-300 border border-rose-500/20",
} satisfies Record<Candidate["status"], string>;

interface Props {
  candidate: Candidate;
  onDragStart: (event: React.DragEvent, candidate: Candidate) => void;
}

export function CandidateCard({ candidate, onDragStart }: Props) {
  const {
    selectCandidate,
    moveCandidate,
    toggleSelectId,
    selectedIds,
    rejectCandidate,
    scheduleInterview,
    restoreSnapshot,
    density,
  } = usePipelineStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isSelected = selectedIds.has(candidate.id);
  const stageAge = daysInStage(candidate);
  const showAging = stageAge >= 3;

  return (
    <div
      key={`${candidate.id}-${candidate.stage}`}
      draggable
      onDragStart={(event) => {
        setIsDragging(true);
        onDragStart(event, candidate);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "group relative rounded-xl border bg-[#1a2236] select-none transition-all duration-150 cursor-grab active:cursor-grabbing",
        density === "compact" ? "p-2.5" : density === "spacious" ? "p-4" : "p-3.5",
        "border-white/[0.07] hover:border-white/[0.18] hover:bg-[#20293d]",
        isSelected && "border-indigo-500/50 bg-indigo-500/[0.05]",
        candidate.status === "Rejected" && "opacity-60",
        isDragging && "opacity-40 scale-[0.97]",
        reducedMotion ? "" : "animate-scaleIn",
      )}
    >
      <label className="absolute left-3 top-3 z-10">
        <span className="sr-only">Select {candidate.name}</span>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectId(candidate.id)}
          className="peer sr-only"
        />
        <span className="flex h-4 w-4 items-center justify-center rounded border border-white/25 bg-[#0c0f1a] opacity-0 transition-all duration-200 group-hover:opacity-100 peer-checked:opacity-100 peer-checked:border-indigo-500 peer-checked:bg-indigo-500">
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </label>

      <div className="flex items-start gap-2.5 cursor-pointer" onClick={() => selectCandidate(candidate)}>
        {density !== "compact" && (
          <Avatar
            initials={candidate.initials}
            gradient={candidate.avatarColor}
            size={density === "spacious" ? "md" : "sm"}
            className={density === "spacious" ? "w-9 h-9 text-sm" : ""}
          />
        )}
        {density === "compact" && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-semibold text-white">
            {candidate.initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("truncate font-semibold text-slate-100", density === "compact" ? "text-[12px]" : "text-[13px]")}>
              {candidate.name}
            </p>
            <ScoreBadge score={candidate.matchScore} size="sm" />
          </div>
          {density !== "compact" && (
            <>
              <p className="mt-0.5 truncate text-[11px] leading-snug text-slate-500">
                {candidate.currentRole}
                <span className="text-slate-600"> · </span>
                {candidate.currentCompany}
              </p>
              {(density === "spacious" || candidate.tags.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {candidate.tags.slice(0, density === "spacious" ? 3 : 2).map((tag) => (
                    <span key={tag} className={cn("rounded-full border px-2 py-0.5 text-[10px]", TAG_COLORS[tag])}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {density === "spacious" && (
                <p className="mt-2 text-[11px] text-slate-500">{candidate.location}</p>
              )}
            </>
          )}
        </div>
      </div>

      {density !== "compact" && (
        <div className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className={cn("h-full rounded-full", scoreBar(candidate.matchScore))} style={{ width: `${candidate.matchScore}%` }} />
        </div>
      )}

      {density === "spacious" && <div className="mt-3 h-px bg-white/[0.06]" />}

      <div className="mt-2.5 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {density !== "compact" && (
            <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              {expLabel(candidate.experience)}
            </span>
          )}
          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", STATUS[candidate.status])}>
            {candidate.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showAging && (
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]",
              stageAge >= 7
                ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300",
            )}>
              <Clock size={11} />
              {stageAge}d
            </span>
          )}
          <span className="text-[10px] text-slate-600">{formatRelativeTime(candidate.lastActivity)}</span>
        </div>
      </div>

      <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((value) => !value);
          }}
          aria-label={`Open actions for ${candidate.name}`}
          className="rounded-md p-1 text-slate-500 transition-all duration-200 hover:bg-white/[0.1] hover:text-white focus-visible:bg-white/[0.1] focus-visible:text-white active:scale-[0.98]"
        >
          <MoreHorizontal size={14} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-7 z-50 min-w-[180px] rounded-xl border border-white/[0.1] bg-[#1e2a40] py-1.5 shadow-2xl shadow-black/60 animate-scaleIn"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <MenuItem icon={Eye} label="View profile" onClick={() => { selectCandidate(candidate); setMenuOpen(false); }} />
            <MenuItem
              icon={Calendar}
              label="Schedule interview"
              onClick={() => {
                scheduleInterview(candidate.id, {
                  date: new Date().toISOString().slice(0, 10),
                  time: "10:00",
                  interviewer: "Priya Sharma",
                  notes: "Scheduled from board quick action",
                });
                showToast({ message: `Interview scheduled for ${candidate.name}`, type: "success", undoAction: restoreSnapshot });
                setMenuOpen(false);
              }}
            />
            <div className="my-1.5 border-t border-white/[0.07]" />
            <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Move to stage</p>
            {STAGES.filter((stage) => stage !== candidate.stage).map((stage) => (
              <MenuItem
                key={stage}
                icon={ArrowRight}
                label={stage}
                dot={STAGE_CONFIG[stage].dot}
                onClick={() => {
                  moveCandidate(candidate.id, stage);
                  showToast({ message: `${candidate.name} moved to ${stage}`, type: "success", undoAction: restoreSnapshot });
                  setMenuOpen(false);
                }}
              />
            ))}
            <div className="my-1.5 border-t border-white/[0.07]" />
            <MenuItem
              icon={XCircle}
              label="Reject candidate"
              onClick={() => {
                rejectCandidate(candidate.id);
                showToast({ message: `${candidate.name} rejected`, type: "warning", undoAction: restoreSnapshot });
                setMenuOpen(false);
              }}
              danger
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
  dot,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-[12px] transition-all duration-200",
        danger
          ? "text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:bg-rose-500/10 focus-visible:text-rose-200"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white",
      )}
    >
      {dot && <div className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      <Icon size={12} />
      <span>{label}</span>
    </button>
  );
}
