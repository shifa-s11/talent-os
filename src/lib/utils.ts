import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  Candidate,
  CandidateTag,
  ExperienceBracket,
  FilterState,
  Stage,
} from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STAGES: Stage[] = [
  "Applied", "Shortlisted", "Interview", "Offered", "Hired",
];

export const STAGE_CONFIG = {
  Applied: { border: "border-blue-500", bg: "bg-blue-500/10", text: "text-blue-300", dot: "bg-blue-400" },
  Shortlisted: { border: "border-violet-500", bg: "bg-violet-500/10", text: "text-violet-300", dot: "bg-violet-400" },
  Interview: { border: "border-amber-500", bg: "bg-amber-500/10", text: "text-amber-300", dot: "bg-amber-400" },
  Offered: { border: "border-cyan-500", bg: "bg-cyan-500/10", text: "text-cyan-300", dot: "bg-cyan-400" },
  Hired: { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
} satisfies Record<Stage, { border: string; bg: string; text: string; dot: string }>;

export const TAG_COLORS: Record<CandidateTag, string> = {
  Referral: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "Immediate Joiner": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Notice Period": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Design System Fit": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Ex-FAANG": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Open Source": "bg-teal-500/15 text-teal-300 border-teal-500/30",
  "Requires Relocation": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Negotiating: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const scoreColor = (score: number) =>
  score >= 80 ? "text-emerald-300" : score >= 60 ? "text-amber-300" : "text-rose-300";

export const scoreBg = (score: number) =>
  score >= 80
    ? "bg-emerald-500/15 border-emerald-500/30"
    : score >= 60
      ? "bg-amber-500/15 border-amber-500/30"
      : "bg-rose-500/15 border-rose-500/30";

export const scoreBar = (score: number) =>
  score >= 80 ? "bg-emerald-400" : score >= 60 ? "bg-amber-400" : "bg-rose-400";

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDate(iso: string): string {
  return fmtDate(iso);
}

export function formatRelativeTime(iso: string): string {
  return relativeTime(iso);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function expLabel(years: number): string {
  if (years <= 2) return "0-2 yrs";
  if (years <= 5) return "3-5 yrs";
  if (years <= 8) return "5-8 yrs";
  return "8+ yrs";
}

export function expBracket(years: number): ExperienceBracket {
  if (years <= 2) return "0-2";
  if (years <= 5) return "3-5";
  if (years <= 8) return "5-8";
  return "8+";
}

export function daysInStage(candidate: Candidate): number {
  const stageEvents = [...candidate.timeline]
    .reverse()
    .find((event) =>
      event.event?.startsWith("Moved to") ||
      event.stage === candidate.stage ||
      event.event === candidate.stage,
    );
  const sourceDate = stageEvents?.date ?? candidate.lastActivity;
  return Math.floor((Date.now() - new Date(sourceDate).getTime()) / 86_400_000);
}

export function filterCandidates(candidates: Candidate[], filters: FilterState): Candidate[] {
  return candidates.filter((candidate) => {
    if (filters.search) {
      const query = filters.search.toLowerCase();
      if (
        !candidate.name.toLowerCase().includes(query) &&
        !candidate.currentCompany.toLowerCase().includes(query) &&
        !candidate.currentRole.toLowerCase().includes(query)
      ) return false;
    }
    if (filters.stages.length > 0 && !filters.stages.includes(candidate.stage)) return false;
    if (filters.experienceBracket !== "Any" && candidate.experienceBracket !== filters.experienceBracket) return false;
    if (filters.scoreRange === "80-100" && candidate.matchScore < 80) return false;
    if (filters.scoreRange === "60-79" && (candidate.matchScore < 60 || candidate.matchScore >= 80)) return false;
    if (filters.scoreRange === "below-60" && candidate.matchScore >= 60) return false;
    if (filters.staleOnly && daysInStage(candidate) < 5) return false;
    if (filters.tags.length > 0 && !filters.tags.every((tag) => candidate.tags.includes(tag))) return false;
    return true;
  });
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.search) count++;
  if (filters.stages.length > 0) count++;
  if (filters.experienceBracket !== "Any") count++;
  if (filters.scoreRange !== "Any") count++;
  if (filters.staleOnly) count++;
  if (filters.tags.length > 0) count++;
  return count;
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.search !== "" ||
    filters.stages.length > 0 ||
    filters.experienceBracket !== "Any" ||
    filters.scoreRange !== "Any" ||
    filters.staleOnly ||
    filters.tags.length > 0
  );
}

export function getCandidatesByStage(
  candidates: Candidate[],
  filters: FilterState,
  stage: Stage,
): Candidate[] {
  return filterCandidates(candidates, filters).filter((candidate) => candidate.stage === stage);
}
