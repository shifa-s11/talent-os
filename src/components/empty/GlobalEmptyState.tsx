"use client";

import { Plus } from "lucide-react";
import { usePipelineStore } from "@/store/usePipelineStore";

export function GlobalEmptyState() {
  const { openNewCandidateModal } = usePipelineStore();

  return (
    <div className="flex-1 min-h-0 p-6 animate-fadeIn">
      <div className="h-full rounded-3xl border border-white/[0.08] bg-[#111827] flex flex-col items-center justify-center text-center px-6">
        <InlineIllustration />
        <h2 className="mt-6 text-2xl font-display font-semibold text-white">
          No candidates yet
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
          Add your first candidate to start building the pipeline.
        </p>
        <button
          onClick={() => openNewCandidateModal()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:bg-indigo-500 focus-visible:bg-indigo-500 active:scale-[0.98]"
        >
          <Plus size={16} />
          Add Candidate
        </button>
      </div>
    </div>
  );
}

function InlineIllustration() {
  return (
    <svg width="220" height="140" viewBox="0 0 220 140" fill="none" aria-hidden="true">
      <rect x="18" y="34" width="72" height="86" rx="18" fill="#172033" stroke="rgba(255,255,255,0.08)" />
      <rect x="44" y="52" width="20" height="20" rx="10" fill="#6366F1" fillOpacity="0.22" />
      <rect x="34" y="82" width="40" height="8" rx="4" fill="#475569" />
      <rect x="30" y="96" width="48" height="6" rx="3" fill="#334155" />

      <rect x="126" y="20" width="76" height="94" rx="20" fill="#141C2D" stroke="rgba(255,255,255,0.08)" />
      <rect x="152" y="38" width="22" height="22" rx="11" fill="#10B981" fillOpacity="0.24" />
      <rect x="142" y="72" width="44" height="8" rx="4" fill="#64748B" />
      <rect x="138" y="86" width="52" height="6" rx="3" fill="#334155" />

      <path d="M92 77H126" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="77" r="10" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
      <path d="M106 77l3 3 5-6" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
