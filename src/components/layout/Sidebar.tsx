"use client";

import {
  LayoutDashboard, GitBranch, Users,
  Briefcase, BarChart2, Settings,
  ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: GitBranch, label: "Pipeline", active: true, badge: 15 },
  { icon: Users, label: "Candidates" },
  { icon: Briefcase, label: "Jobs" },
  { icon: BarChart2, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}: Props) {
  const effectiveCollapsed = isMobileOpen ? false : collapsed;

  const sidebarContent = (
    <>
      <div className="h-15 flex items-center gap-3 px-4 border-b border-white/6 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Zap size={14} className="text-white" />
        </div>
        {!effectiveCollapsed && (
          <span className="font-display font-bold text-[15px] text-white tracking-tight whitespace-nowrap">
            TalentOS
          </span>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {!effectiveCollapsed && (
          <p className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase px-2 py-2 mt-1">
            Menu
          </p>
        )}
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              aria-label={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                item.active
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-slate-400 hover:text-slate-100 focus-visible:text-slate-100 hover:bg-white/5 focus-visible:bg-white/5",
              )}
            >
              {item.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <Icon size={16} className="shrink-0" />
              {!effectiveCollapsed && (
                <>
                  <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {effectiveCollapsed && item.badge && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-white/6 shrink-0">
        <button
          onClick={onToggle}
          aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-white focus-visible:text-white hover:bg-white/5 focus-visible:bg-white/5 transition-all duration-200 text-sm"
        >
          <div className="shrink-0">
            {effectiveCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </div>
          {!effectiveCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col h-full bg-[#111827] border-r border-white/6",
          "shrink-0 transition-all duration-300 overflow-hidden",
          effectiveCollapsed ? "w-16" : "w-55",
        )}
      >
        {sidebarContent}
      </aside>

      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition-all duration-200",
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isMobileOpen}
      >
        <button
          onClick={onMobileClose}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-200",
            isMobileOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close navigation menu"
        />
        <aside
          className={cn(
            "relative h-full w-72 max-w-[85vw] bg-[#111827] border-r border-white/6 flex flex-col overflow-hidden transition-all duration-200",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
