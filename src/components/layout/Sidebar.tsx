
"use client";

import {
  LayoutDashboard, GitBranch, Users,
  Briefcase, BarChart2, Settings,
  ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: GitBranch,       label: "Pipeline",  active: true, badge: 15 },
  { icon: Users,           label: "Candidates" },
  { icon: Briefcase,       label: "Jobs" },
  { icon: BarChart2,       label: "Reports" },
  { icon: Settings,        label: "Settings" },
];

interface Props {
  collapsed: boolean;
  onToggle:  () => void;
}

export function Sidebar({ collapsed, onToggle }: Props) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full bg-[#111827] border-r border-white/6",
        "shrink-0 transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-55",
      )}
    >
      {/* ── Logo ── */}
      <div className="h-15 flex items-center gap-3 px-4 border-b border-white/6 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-[15px] text-white tracking-tight whitespace-nowrap">
            TalentOS
          </span>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase px-2 py-2 mt-1">
            Menu
          </p>
        )}
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                item.active
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5",
              )}
            >
              {item.active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <Icon size={16} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {/* collapsed badge dot */}
              {collapsed && item.badge && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div className="p-2 border-t border-white/6 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <div className="shrink-0">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </div>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}