"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Candidate } from "@/types";
import { daysInStage } from "@/lib/utils";

interface Suggestion {
  title: string;
  subtitle: string;
  cta: string;
  action: () => void;
  border: string;
}

export function NextBestAction({
  candidate,
  onSchedule,
  onMove,
  onFollowUp,
}: {
  candidate: Candidate;
  onSchedule: () => void;
  onMove: () => void;
  onFollowUp: () => void;
}) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const result: Suggestion[] = [];
    const age = daysInStage(candidate);
    const lastInterview = [...candidate.timeline].reverse().find((event) => event.stage === "Interview" || event.icon === "interview");

    if (candidate.stage === "Applied" && age >= 2) {
      result.push({ title: "Review application", subtitle: `Candidate has been waiting ${age} days`, cta: "Review", action: onMove, border: "border-amber-500" });
    }
    if (candidate.stage === "Shortlisted" && !lastInterview) {
      result.push({ title: "Schedule technical round", subtitle: "Move pipeline forward", cta: "Schedule", action: onSchedule, border: "border-indigo-500" });
    }
    if (candidate.stage === "Interview" && age >= 5) {
      result.push({ title: "Follow up", subtitle: `No activity in ${age} days`, cta: "Follow up", action: onFollowUp, border: "border-amber-500" });
    }
    if (candidate.stage === "Offered" && age >= 3) {
      result.push({ title: "Follow up on offer", subtitle: `Awaiting response for ${age} days`, cta: "Follow up", action: onFollowUp, border: "border-cyan-500" });
    }
    if (candidate.matchScore >= 85 && candidate.stage === "Applied") {
      result.push({ title: "Fast-track to shortlist", subtitle: "Strong match score", cta: "Move", action: onMove, border: "border-emerald-500" });
    }
    if (candidate.tags.includes("Immediate Joiner")) {
      result.push({ title: "Prioritize", subtitle: "Candidate available immediately", cta: "Schedule", action: onSchedule, border: "border-emerald-500" });
    }
    return result.slice(0, 3);
  }, [candidate, onFollowUp, onMove, onSchedule]);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1a2236]">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-white/[0.03] focus-visible:bg-white/[0.03]"
      >
        Suggested actions
        <ChevronDown size={15} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 animate-fadeIn">
          {suggestions.length > 0 ? suggestions.map((suggestion) => (
            <div key={suggestion.title} className={`rounded-xl border-l-2 ${suggestion.border} bg-[#111827] p-3`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{suggestion.title}</p>
                  <p className="text-xs text-slate-500">{suggestion.subtitle}</p>
                </div>
                <button
                  onClick={suggestion.action}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition-all duration-200 hover:border-white/[0.16] hover:text-white focus-visible:border-white/[0.16] focus-visible:text-white"
                >
                  {suggestion.cta}
                </button>
              </div>
            </div>
          )) : (
            <p className="text-xs text-slate-500">No suggested actions right now.</p>
          )}
        </div>
      )}
    </div>
  );
}
