"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, Plus, Menu, Search, X } from "lucide-react";
import { usePipelineStore } from "@/store/usePipelineStore";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { cn } from "@/lib/utils";

export function Header({ onMobileMenu }: { onMobileMenu: () => void }) {
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { filters, setFilters, openNewCandidateModal } = usePipelineStore();

  useKeyboardShortcut("/", () => {
    if (window.innerWidth < 640) {
      setIsMobileSearchOpen(true);
      setTimeout(() => mobileSearchRef.current?.focus(), 0);
      return;
    }
    desktopSearchRef.current?.focus();
  }, { preventDefault: true });

  useEffect(() => {
    if (!isMobileSearchOpen) return undefined;
    const timeout = window.setTimeout(() => {
      mobileSearchRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isMobileSearchOpen]);

  return (
    <>
      <header className="relative h-15 flex items-center gap-3 px-5 bg-[#111827] border-b border-white/6 shrink-0 z-30">
        <button
          onClick={onMobileMenu}
          className="md:hidden p-2 rounded-lg hover:bg-white/6 focus-visible:bg-white/6 text-slate-400 hover:text-white focus-visible:text-white transition-all duration-200 active:scale-[0.98]"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-sm">
          <span className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Jobs</span>
          <ChevronRight size={13} className="text-slate-700" />
          <span className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Frontend Engineer</span>
          <ChevronRight size={13} className="text-slate-700" />
          <span className="text-slate-200 font-medium">Pipeline</span>
        </div>

        <div className="flex-1" />

        <div
          className={cn(
            "hidden sm:flex items-center gap-2 bg-[#1a2236] border rounded-lg px-3 py-2 w-52 transition-all duration-200",
            "border-white/8 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]",
          )}
        >
          <Search size={13} className="text-slate-500 shrink-0" />
          <input
            ref={desktopSearchRef}
            type="text"
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none flex-1 min-w-0"
          />
          <kbd className="text-[10px] text-slate-600 font-mono border border-white/8 rounded px-1 py-0.5">
            /
          </kbd>
        </div>

        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="sm:hidden relative p-2 rounded-lg hover:bg-white/6 focus-visible:bg-white/6 text-slate-400 hover:text-white focus-visible:text-white transition-all duration-200 active:scale-[0.98]"
          aria-label="Open mobile search"
        >
          <Search size={16} />
        </button>

        <button
          className="relative p-2 rounded-lg hover:bg-white/6 focus-visible:bg-white/6 text-slate-400 hover:text-white focus-visible:text-white transition-all duration-200 active:scale-[0.98]"
          aria-label="Open notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        <button
          onClick={() => openNewCandidateModal()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 focus-visible:bg-indigo-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Candidate</span>
        </button>

        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer border-2 border-transparent hover:border-indigo-400 transition-all duration-200 shrink-0">
          PS
        </div>
      </header>

      <div
        className={cn(
          "sm:hidden fixed inset-0 z-40 transition-all duration-200",
          isMobileSearchOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isMobileSearchOpen}
      >
        <button
          onClick={() => setIsMobileSearchOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-200",
            isMobileSearchOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close mobile search"
        />
        <div
          className={cn(
            "absolute left-0 right-0 top-14 border-b border-white/[0.08] bg-[#111827] px-4 py-3 shadow-xl shadow-black/40 transition-all duration-200",
            isMobileSearchOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          )}
        >
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1a2236] px-3 py-2">
            <Search size={15} className="text-slate-500 shrink-0" />
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder="Search candidates..."
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            />
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1 rounded-md text-slate-500 hover:text-white focus-visible:text-white transition-all duration-200"
              aria-label="Dismiss mobile search"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
