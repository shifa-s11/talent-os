
"use client";

import { useMemo }           from "react";
import { usePipelineStore }  from "@/store/usePipelineStore";
import { StageColumn }       from "./StageColumn";
import { SkeletonColumn }    from "@/components/ui/Skeleton";
import { EmptySearchResults } from "@/components/empty/EmptySearchResults";
import { filterCandidates, STAGES, hasActiveFilters } from "@/lib/utils";
import type { Stage }        from "@/types";

export function KanbanBoard() {
  const { candidates, filters, isLoading } = usePipelineStore();

  /* Apply filters */
  const filtered = useMemo(
    () => filterCandidates(candidates, filters),
    [candidates, filters],
  );

  /* Group by stage */
  const byStage = useMemo(() => {
    const map = Object.fromEntries(
      STAGES.map((s) => [s, [] as typeof filtered]),
    ) as Record<Stage, typeof filtered>;
    filtered.forEach((c) => map[c.stage].push(c));
    return map;
  }, [filtered]);

  const hasAnyActiveFilters = hasActiveFilters(filters);

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="visible-scrollbar flex flex-1 min-h-0 gap-4 overflow-x-auto p-4 pt-1.5 pb-4 kanban-scroll">
        {STAGES.map((s) => (
          <SkeletonColumn key={s} />
        ))}
      </div>
    );
  }

  /* ── No results ── */
  if (filtered.length === 0 && hasAnyActiveFilters) return <EmptySearchResults />;

  /* ── Board ── */
  return (
    <div className="visible-scrollbar flex flex-1 min-h-0 gap-4 overflow-x-auto p-4 pt-1.5 pb-4 kanban-scroll">
      {STAGES.map((stage) => (
        <StageColumn
          key={stage}
          stage={stage}
          candidates={byStage[stage]}
        />
      ))}
    </div>
  );
}
