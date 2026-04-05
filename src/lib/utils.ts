

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Stage, ExperienceBracket, FilterState, Candidate } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Stage config ── */
export const STAGES: Stage[] = [
  "Applied", "Shortlisted", "Interview", "Offered", "Hired",
];

export const STAGE_CONFIG = {
  Applied:     { border:"border-blue-500",    bg:"bg-blue-500/10",    text:"text-blue-400",    dot:"bg-blue-400"    },
  Shortlisted: { border:"border-violet-500",  bg:"bg-violet-500/10",  text:"text-violet-400",  dot:"bg-violet-400"  },
  Interview:   { border:"border-amber-500",   bg:"bg-amber-500/10",   text:"text-amber-400",   dot:"bg-amber-400"   },
  Offered:     { border:"border-cyan-500",    bg:"bg-cyan-500/10",    text:"text-cyan-400",    dot:"bg-cyan-400"    },
  Hired:       { border:"border-emerald-500", bg:"bg-emerald-500/10", text:"text-emerald-400", dot:"bg-emerald-400" },
} satisfies Record<Stage, { border:string; bg:string; text:string; dot:string }>;

/* ── Score helpers ── */
export const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-rose-400";

export const scoreBg = (s: number) =>
  s >= 80
    ? "bg-emerald-500/15 border-emerald-500/30"
    : s >= 60
    ? "bg-amber-500/15 border-amber-500/30"
    : "bg-rose-500/15 border-rose-500/30";

export const scoreBar = (s: number) =>
  s >= 80 ? "bg-emerald-400" : s >= 60 ? "bg-amber-400" : "bg-rose-400";

/* ── Time helpers ── */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short",
  });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/* ── Experience ── */
export function expLabel(yrs: number): string {
  if (yrs <= 2) return "0–2 yrs";
  if (yrs <= 5) return "3–5 yrs";
  if (yrs <= 8) return "5–8 yrs";
  return "8+ yrs";
}

export function expBracket(yrs: number): ExperienceBracket {
  if (yrs <= 2) return "0-2";
  if (yrs <= 5) return "3-5";
  if (yrs <= 8) return "5-8";
  return "8+";
}

/* ── Filter ── */
export function filterCandidates(
  candidates: Candidate[],
  f: FilterState,
): Candidate[] {
  return candidates.filter((c) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.currentCompany.toLowerCase().includes(q) &&
        !c.currentRole.toLowerCase().includes(q)
      ) return false;
    }
    if (f.stages.length > 0 && !f.stages.includes(c.stage)) return false;
    if (f.experienceBracket !== "Any" && c.experienceBracket !== f.experienceBracket) return false;
    if (f.scoreRange === "80-100"   && c.matchScore < 80)                        return false;
    if (f.scoreRange === "60-79"    && (c.matchScore < 60 || c.matchScore >= 80)) return false;
    if (f.scoreRange === "below-60" && c.matchScore >= 60)                       return false;
    return true;
  });
}

export function countActiveFilters(f: FilterState): number {
  let n = 0;
  if (f.search)                      n++;
  if (f.stages.length > 0)           n++;
  if (f.experienceBracket !== "Any") n++;
  if (f.scoreRange !== "Any")        n++;
  return n;
}