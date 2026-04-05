"use client";

import { useMemo } from "react";
import { usePipelineStore } from "@/store/usePipelineStore";
import { daysInStage } from "@/lib/utils";

export function InsightsStrip() {
  const { candidates, setFilters } = usePipelineStore();

  const metrics = useMemo(() => {
    const total = candidates.length;
    const hired = candidates.filter((candidate) => candidate.stage === "Hired").length;
    const offered = candidates.filter((candidate) => candidate.stage === "Offered").length;
    const conversion = total > 0 ? Math.round((hired / total) * 100) : 0;
    const avgScore = total > 0
      ? Math.round(candidates.reduce((sum, candidate) => sum + candidate.matchScore, 0) / total)
      : 0;
    const offerAcceptance = offered > 0 ? Math.round((hired / offered) * 100) : 0;
    const lagCandidates = candidates
      .map((candidate) => {
        const applied = candidate.timeline.find((event) => event.stage === "Applied");
        const shortlisted = candidate.timeline.find((event) => event.stage === "Shortlisted");
        if (!applied || !shortlisted) return null;
        return Math.floor((new Date(shortlisted.date).getTime() - new Date(applied.date).getTime()) / 86_400_000);
      })
      .filter((value): value is number => value !== null);
    const avgLag = lagCandidates.length > 0
      ? Math.round(lagCandidates.reduce((sum, value) => sum + value, 0) / lagCandidates.length)
      : 0;
    const activeOffers = candidates.filter((candidate) => candidate.stage === "Offered").length;
    const oldestOffer = Math.max(...candidates.filter((candidate) => candidate.stage === "Offered").map(daysInStage), 0);

    return [
      { label: "Applied → hired", value: `${conversion}%`, subtext: `${hired} hires`, signal: conversion >= 5 ? "text-emerald-300 border-emerald-500" : conversion >= 2 ? "text-amber-300 border-amber-500" : "text-rose-300 border-rose-500" },
      { label: "Avg match score", value: `${avgScore}`, subtext: "Across all candidates", signal: avgScore >= 75 ? "text-emerald-300 border-emerald-500" : avgScore >= 60 ? "text-amber-300 border-amber-500" : "text-rose-300 border-rose-500" },
      { label: "Offer acceptance", value: `${offerAcceptance}%`, subtext: `${offered} active offers`, signal: offerAcceptance >= 70 ? "text-emerald-300 border-emerald-500" : offerAcceptance >= 40 ? "text-amber-300 border-amber-500" : "text-rose-300 border-rose-500" },
      { label: "Avg response lag", value: `${avgLag}d`, subtext: "Applied to shortlist", signal: avgLag <= 3 ? "text-emerald-300 border-emerald-500" : avgLag <= 7 ? "text-amber-300 border-amber-500" : "text-rose-300 border-rose-500" },
      { label: "Active offers", value: `${activeOffers}`, subtext: oldestOffer > 0 ? `Oldest offer ${oldestOffer}d` : "No open offers", signal: activeOffers > 0 && oldestOffer > 7 ? "text-amber-300 border-amber-500" : "text-slate-200 border-slate-600" },
    ];
  }, [candidates]);

  return (
    <div className="px-4 sm:px-6 py-1.5">
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {metrics.map((metric) => (
          <button
            key={metric.label}
            onClick={() => {
              if (metric.label === "Active offers") setFilters({ stages: ["Offered"] });
            }}
            className={`rounded-2xl border-l-2 bg-[#111827] border border-white/[0.06] p-3.5 text-left transition-all duration-150 hover:bg-[#172033] ${metric.signal}`}
          >
            <p className="text-[13px] text-slate-500">{metric.label}</p>
            <p className="mt-1 font-mono text-[22px] font-medium">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-500">{metric.subtext}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
