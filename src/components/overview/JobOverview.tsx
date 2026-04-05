"use client";

import {
  MapPin, Users, Briefcase,
  Building2, UserCheck, TrendingDown,
  Gauge, HandCoins,
} from "lucide-react";
import { JOB } from "@/lib/data";
import { cn, STAGES } from "@/lib/utils";
import { usePipelineStore } from "@/store/usePipelineStore";

const FUNNEL_COLORS = {
  bar: ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-cyan-500", "bg-emerald-500"],
  text: ["text-blue-400", "text-violet-400", "text-amber-400", "text-cyan-400", "text-emerald-400"],
};

export function JobOverview() {
  const candidates = usePipelineStore((state) => state.candidates);
  const totalApplicants = candidates.length;
  const funnelData = STAGES.map((stage) => {
    const count = candidates.filter((candidate) => candidate.stage === stage).length;
    return {
      stage,
      count,
      pct: totalApplicants > 0 ? Math.round((count / totalApplicants) * 100) : 0,
    };
  });
  const maxStageCount = Math.max(...funnelData.map((item) => item.count), 1);
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, candidate) => sum + candidate.matchScore, 0) / candidates.length)
    : 0;
  const activeOffers = candidates.filter((candidate) => candidate.stage === "Offered").length;

  return (
    <div className="bg-[#111827] border-b border-white/[0.06] px-4 sm:px-6 py-3 flex-shrink-0">
      <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Briefcase size={17} className="text-indigo-400" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-display font-semibold text-white leading-tight">
                {JOB.title}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {JOB.openPositions} open
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <MetaChip icon={Building2} label={JOB.department} />
              <MetaChip icon={MapPin} label={JOB.location} />
              <MetaChip icon={UserCheck} label={`HM: ${JOB.hiringManager}`} />
              <MetaChip icon={Users} label={`${totalApplicants} applicants`} />
              <MetaChip icon={Gauge} label={`Avg score: ${avgScore}`} />
              <MetaChip icon={HandCoins} label={`Active offers: ${activeOffers}`} />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 xl:w-96 w-full">
          <div className="mb-2 flex items-center gap-1.5">
            <TrendingDown size={11} className="text-slate-600" />
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              Hiring Funnel
            </span>
          </div>

          <div className="space-y-2">
            {funnelData.map((row, index) => {
              const relativeWidth = Math.round((row.count / maxStageCount) * 100);
              return (
                <div key={row.stage} className="flex items-center gap-2.5">
                  <span className={cn("text-[10px] font-medium w-[72px] flex-shrink-0 truncate", FUNNEL_COLORS.text[index])}>
                    {row.stage}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", FUNNEL_COLORS.bar[index])}
                      style={{ width: `${relativeWidth}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-5 text-right flex-shrink-0">
                    {row.count}
                  </span>
                  <span className="text-[9px] font-mono w-10 text-right flex-shrink-0 text-slate-600">
                    {row.pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <Icon size={11} className="text-slate-600 flex-shrink-0" />
      <span>{label}</span>
    </div>
  );
}
