"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import type { Candidate, Stage } from "@/types";
import { STAGES, cn, formatDate, formatDateTime } from "@/lib/utils";

export function InterviewStatus({
  candidate,
  onSchedule,
}: {
  candidate: Candidate;
  onSchedule: () => void;
}) {
  const latestInterview = useMemo(
    () =>
      [...candidate.timeline]
        .reverse()
        .find((event) => event.icon === "interview"),
    [candidate.timeline],
  );

  const scheduledInterviewDate = useMemo(() => {
    if (!latestInterview?.description) return null;
    const match = latestInterview.description.match(/(\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2}) with/);
    if (!match) return null;
    return new Date(`${match[1]}T${match[2]}:00`);
  }, [latestInterview]);

  const rejectionEvent = useMemo(
    () =>
      [...candidate.timeline]
        .reverse()
        .find((event) => event.icon === "reject"),
    [candidate.timeline],
  );

  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
        Interview Status
      </p>
      <div className="rounded-2xl border border-white/[0.08] bg-[#1a2236] p-4 space-y-4">
        <div className="flex items-center justify-between gap-2" aria-live="polite">
          {STAGES.map((stage, index) => {
            const stageIndex = STAGES.indexOf(candidate.stage);
            const isActive = stage === candidate.stage;
            const isCompleted = index < stageIndex && candidate.status !== "Rejected";
            const isRejected = candidate.status === "Rejected";
            return (
              <div key={stage} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full border text-[11px] font-semibold flex items-center justify-center transition-all duration-200",
                      isRejected && isActive && "border-rose-500 bg-rose-500/15 text-rose-300",
                      !isRejected && isCompleted && "border-emerald-500 bg-emerald-500/15 text-emerald-300",
                      !isRejected && isActive && "border-indigo-500 bg-indigo-500/15 text-indigo-300",
                      !isCompleted && !isActive && "border-white/[0.08] bg-white/[0.03] text-slate-500",
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-full">{stage}</span>
                </div>
                {index < STAGES.length - 1 && (
                  <div className="mx-2 h-[2px] flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-200",
                        isCompleted ? "w-full bg-emerald-500" : isActive ? "w-1/2 bg-indigo-500" : "w-0",
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {candidate.status === "Rejected" && rejectionEvent ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Rejected on {formatDate(rejectionEvent.date)}
          </div>
        ) : latestInterview ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#111827] px-3.5 py-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-1">
              Next Interview
            </p>
            <p className="text-sm text-slate-300">
              {formatDateTime((scheduledInterviewDate ?? new Date(latestInterview.date)).toISOString())} · with {latestInterview.actor ?? "Hiring team"}
            </p>
            {latestInterview.description && (
              <p className="mt-1 text-xs text-slate-500">{latestInterview.description}</p>
            )}
          </div>
        ) : (candidate.stage === "Applied" || candidate.stage === "Shortlisted") ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#111827] px-3.5 py-3">
            <div>
              <p className="text-sm text-slate-300">No interview scheduled</p>
              <p className="text-xs text-slate-500">Set up the first interview to move this candidate forward.</p>
            </div>
            <button
              onClick={onSchedule}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-all duration-200 hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-indigo-200 focus-visible:border-indigo-400/50 focus-visible:bg-indigo-500/15 focus-visible:text-indigo-200 active:scale-[0.98]"
            >
              <Plus size={14} />
              Schedule
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
