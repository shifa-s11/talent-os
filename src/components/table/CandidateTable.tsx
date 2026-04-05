"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  ArrowRight,
  XCircle,
} from "lucide-react";
import type { Candidate, CandidateSortDir, CandidateSortKey, Stage } from "@/types";
import { usePipelineStore } from "@/store/usePipelineStore";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { EmptySearchResults } from "@/components/empty/EmptySearchResults";
import {
  TAG_COLORS,
  cn,
  expLabel,
  filterCandidates,
  formatRelativeTime,
  hasActiveFilters,
  STAGE_CONFIG,
  STAGES,
} from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const PAGE_SIZE = 8;

const STATUS_CLS = {
  Active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
  "On Hold": "bg-amber-500/15 text-amber-300 border border-amber-500/20",
  Rejected: "bg-rose-500/15 text-rose-300 border border-rose-500/20",
} satisfies Record<Candidate["status"], string>;

export function CandidateTable() {
  const {
    candidates,
    filters,
    isLoading,
    selectedIds,
    toggleSelectId,
    selectAll,
    clearSelection,
    selectCandidate,
    moveCandidate,
    rejectCandidate,
    restoreSnapshot,
    sortKey,
    sortDir,
    setSort,
    density,
  } = usePipelineStore();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => filterCandidates(candidates, filters), [candidates, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valueA: string | number = a[sortKey] as string | number;
      let valueB: string | number = b[sortKey] as string | number;
      if (sortKey === "lastActivity") {
        valueA = new Date(valueA as string).getTime();
        valueB = new Date(valueB as string).getTime();
      }
      if (valueA < valueB) return sortDir === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortDir, sortKey]);

  useEffect(() => setPage(1), [filters, filtered.length]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds = paginated.map((candidate) => candidate.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const handleSort = (key: CandidateSortKey) => {
    if (sortKey === key) setSort(key, sortDir === "asc" ? "desc" : "asc");
    else setSort(key, "desc");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="visible-scrollbar flex-1 overflow-auto px-4 pt-1.5 pb-3 animate-fadeIn">
        <table className="w-full min-w-[780px]">
          <tbody>
            {Array.from({ length: PAGE_SIZE }).map((_, index) => <SkeletonRow key={index} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (filtered.length === 0 && hasActiveFilters(filters)) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden animate-fadeIn">
        <div className="visible-scrollbar flex-1 overflow-auto px-4 pt-1.5 pb-3">
          <EmptySearchResults />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden animate-fadeIn">
      <div className="visible-scrollbar flex-1 overflow-auto px-4 pt-1.5 pb-3">
        <table className="w-full min-w-[980px]">
          <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0c0f1a]">
            <tr>
              <th scope="col" className="px-4 py-3 w-10">
                <Checkbox
                  checked={allPageSelected}
                  label="Select all candidates on page"
                  onChange={() => (allPageSelected ? clearSelection() : selectAll(pageIds))}
                />
              </th>
              <SortTh label="Candidate" col="name" current={sortKey} dir={sortDir} onSort={handleSort} />
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current role</th>
              <SortTh label="Exp" col="experience" current={sortKey} dir={sortDir} onSort={handleSort} />
              <SortTh label="Score" col="matchScore" current={sortKey} dir={sortDir} onSort={handleSort} />
              <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tags</th>
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Stage</th>
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <SortTh label="Last active" col="lastActivity" current={sortKey} dir={sortDir} onSort={handleSort} />
              <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04]">
            {paginated.map((candidate) => (
              <TableRow
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedIds.has(candidate.id)}
                menuOpen={openMenu === candidate.id}
                density={density}
                onToggleSelect={() => toggleSelectId(candidate.id)}
                onOpenDrawer={() => selectCandidate(candidate)}
                onMove={(stage) => {
                  moveCandidate(candidate.id, stage);
                  showToast({ message: `${candidate.name} moved to ${stage}`, type: "success", undoAction: restoreSnapshot });
                  setOpenMenu(null);
                }}
                onMenuToggle={() => setOpenMenu((previous) => (previous === candidate.id ? null : candidate.id))}
                onMenuClose={() => setOpenMenu(null)}
                onReject={() => {
                  rejectCandidate(candidate.id);
                  showToast({ message: `${candidate.name} rejected`, type: "warning", undoAction: restoreSnapshot });
                  setOpenMenu(null);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={safePage} totalPages={totalPages} totalCount={sorted.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}

function TableRow({
  candidate,
  isSelected,
  menuOpen,
  density,
  onToggleSelect,
  onOpenDrawer,
  onMove,
  onMenuToggle,
  onMenuClose,
  onReject,
}: {
  candidate: Candidate;
  isSelected: boolean;
  menuOpen: boolean;
  density: ReturnType<typeof usePipelineStore.getState>["density"];
  onToggleSelect: () => void;
  onOpenDrawer: () => void;
  onMove: (stage: Stage) => void;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onReject: () => void;
}) {
  const config = STAGE_CONFIG[candidate.stage];

  return (
    <tr
      onClick={onOpenDrawer}
      className={cn(
        "group cursor-pointer transition-all duration-150",
        density === "compact" ? "[&_td]:py-1.5 [&_td]:px-3" : density === "spacious" ? "[&_td]:py-4 [&_td]:px-4" : "[&_td]:py-3 [&_td]:px-4",
        isSelected ? "bg-indigo-500/[0.05]" : "hover:bg-white/[0.025]",
        candidate.status === "Rejected" && "opacity-60",
      )}
    >
      <td onClick={(event) => event.stopPropagation()}>
        <Checkbox checked={isSelected} label={`Select ${candidate.name}`} onChange={onToggleSelect} />
      </td>
      <td>
        <div className="flex items-center gap-2.5">
          {density !== "compact" ? (
            <Avatar
              initials={candidate.initials}
              gradient={candidate.avatarColor}
              size={density === "spacious" ? "md" : "sm"}
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-semibold text-white">
              {candidate.initials}
            </div>
          )}
          <div className="min-w-0">
            <p className={cn("truncate font-semibold text-slate-100", density === "compact" ? "text-[13px]" : "text-[14px]")}>{candidate.name}</p>
            <p className="truncate text-[11px] text-slate-500">{candidate.email}</p>
          </div>
        </div>
      </td>
      <td>
        <p className="max-w-[180px] truncate text-[13px] text-slate-300">{candidate.currentRole}</p>
        <p className="truncate text-[11px] text-slate-500">{candidate.currentCompany}</p>
        {density === "spacious" && <p className="mt-1 text-[11px] text-slate-500">{candidate.location}</p>}
      </td>
      <td>
        <span className="whitespace-nowrap rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-mono text-slate-400">
          {expLabel(candidate.experience)}
        </span>
      </td>
      <td><ScoreBadge score={candidate.matchScore} bar={density !== "compact"} /></td>
      <td className="hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {candidate.tags.slice(0, 2).map((tag) => (
            <span key={tag} className={cn("rounded-full border px-2 py-0.5 text-[10px]", TAG_COLORS[tag])}>{tag}</span>
          ))}
          {candidate.tags.length > 2 && <span className="text-[10px] text-slate-500">+{candidate.tags.length - 2} more</span>}
        </div>
      </td>
      <td>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", config.bg, config.text, config.border)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
          {candidate.stage}
        </span>
      </td>
      <td><span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", STATUS_CLS[candidate.status])}>{candidate.status}</span></td>
      <td><span className="text-[12px] text-slate-500">{formatRelativeTime(candidate.lastActivity)}</span></td>
      <td onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
          <ActionBtn icon={Eye} title="View profile" onClick={onOpenDrawer} />
          <div className="relative">
            <ActionBtn icon={ArrowRight} title="Move stage" onClick={onMenuToggle} active={menuOpen} />
            {menuOpen && (
              <div className="absolute right-0 top-8 z-50 min-w-[148px] rounded-xl border border-white/[0.1] bg-[#1e2a40] py-1.5 shadow-2xl shadow-black/60 animate-scaleIn" onMouseLeave={onMenuClose}>
                <p className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-slate-600">Move to</p>
                {STAGES.filter((stage) => stage !== candidate.stage).map((stage) => {
                  const stageConfig = STAGE_CONFIG[stage];
                  return (
                    <button
                      key={stage}
                      onClick={() => onMove(stage)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-slate-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white"
                    >
                      <div className={cn("h-1.5 w-1.5 rounded-full", stageConfig.dot)} />
                      {stage}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <ActionBtn icon={XCircle} title="Reject" onClick={onReject} danger />
        </div>
      </td>
    </tr>
  );
}

function SortTh({
  label,
  col,
  current,
  dir,
  onSort,
}: {
  label: string;
  col: CandidateSortKey;
  current: CandidateSortKey;
  dir: CandidateSortDir;
  onSort: (key: CandidateSortKey) => void;
}) {
  const active = current === col;
  const ariaSort = active ? (dir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th scope="col" aria-sort={ariaSort} className="px-4 py-3 text-left">
      <button
        onClick={() => onSort(col)}
        className={cn(
          "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200",
          active ? "text-indigo-300" : "text-slate-500 hover:text-slate-300 focus-visible:text-slate-300",
        )}
      >
        {label}
        {active ? dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} /> : <ChevronsUpDown size={11} className="opacity-30" />}
      </button>
    </th>
  );
}

function Checkbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex h-4 w-4 items-center justify-center rounded border border-white/[0.2] bg-[#0c0f1a] transition-all duration-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-500">
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </label>
  );
}

function ActionBtn({
  icon: Icon,
  title,
  onClick,
  danger,
  active,
}: {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "rounded-lg p-1.5 text-sm transition-all duration-200 active:scale-[0.98]",
        danger
          ? "text-slate-600 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:bg-rose-500/10 focus-visible:text-rose-300"
          : active
            ? "bg-indigo-500/15 text-indigo-300"
            : "text-slate-600 hover:bg-white/[0.06] hover:text-slate-200 focus-visible:bg-white/[0.06] focus-visible:text-slate-200",
      )}
    >
      <Icon size={13} />
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const getPageNums = () => {
    const delta = 2;
    const range: number[] = [];
    for (let value = Math.max(1, page - delta); value <= Math.min(totalPages, page + delta); value++) {
      range.push(value);
    }
    return range;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3">
      <span aria-live="polite" aria-atomic="true" className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-300">{from}-{to}</span> of <span className="font-medium text-slate-300">{totalCount}</span> candidates
      </span>
      <div className="flex items-center gap-1">
        <PageBtn onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={13} /></PageBtn>
        {getPageNums().map((value) => (
          <PageBtn key={value} onClick={() => onChange(value)} active={value === page}>{value}</PageBtn>
        ))}
        <PageBtn onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page"><ChevronRight size={13} /></PageBtn>
      </div>
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
  active,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  [key: string]: unknown;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "flex h-7 min-w-[28px] items-center justify-center rounded-lg px-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.98]",
        active
          ? "bg-indigo-600 text-white"
          : disabled
            ? "cursor-not-allowed text-slate-700"
            : "border border-transparent text-slate-400 hover:border-white/[0.08] hover:bg-white/[0.07] hover:text-white focus-visible:border-white/[0.08] focus-visible:bg-white/[0.07] focus-visible:text-white",
      )}
    >
      {children}
    </button>
  );
}
