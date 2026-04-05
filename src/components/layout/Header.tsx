
"use client";

import { useRef } from "react";
import { Bell, ChevronRight, Plus, Menu } from "lucide-react";
import { usePipelineStore }      from "@/store/usePipelineStore";
import { useKeyboardShortcut }   from "@/hooks/useKeyboardShortcut";
import { cn }                    from "@/lib/utils";

export function Header({ onMobileMenu }: { onMobileMenu: () => void }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const { filters, setFilters, setNewCandidateModalOpen } = usePipelineStore();

  // press "/" anywhere → focus search
  useKeyboardShortcut("/", () => searchRef.current?.focus(), { preventDefault: true });

  return (
    <header className="h-15 flex items-center gap-3 px-5 bg-[#111827] border-b border-white/6 shrink-0 z-30">

      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenu}
        className="md:hidden p-2 rounded-lg hover:bg-white/6 text-slate-400 hover:text-white transition-all"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm">
        <span className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Jobs</span>
        <ChevronRight size={13} className="text-slate-700" />
        <span className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Frontend Engineer</span>
        <ChevronRight size={13} className="text-slate-700" />
        <span className="text-slate-200 font-medium">Pipeline</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div
        className={cn(
          "hidden sm:flex items-center gap-2 bg-[#1a2236] border rounded-lg px-3 py-2 w-52 transition-all duration-200",
          "border-white/8 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]",
        )}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search candidates…"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none flex-1 min-w-0"
        />
        <kbd className="text-[10px] text-slate-600 font-mono border border-white/8 rounded px-1 py-0.5">
          /
        </kbd>
      </div>

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg hover:bg-white/6 text-slate-400 hover:text-white transition-all">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
      </button>

      {/* New Candidate */}
      <button
        onClick={() => setNewCandidateModalOpen(true)}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-indigo-500/20"
      >
        <Plus size={14} />
        <span className="hidden sm:inline">New Candidate</span>
      </button>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer border-2 border-transparent hover:border-indigo-400 transition-all shrink-0">
        PS
      </div>
    </header>
  );
}