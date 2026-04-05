"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { JobOverview } from "@/components/overview/JobOverview";
import { InsightsStrip } from "@/components/overview/InsightsStrip";
import { FilterBar } from "@/components/filters/FilterBar";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { CandidateTable } from "@/components/table/CandidateTable";
import { CandidateDrawer } from "@/components/drawer/CandidateDrawer";
import { BulkActionBar } from "@/components/BulkActionBar";
import { NewCandidateModal } from "@/components/modals/NewCandidateModal";
import { GlobalEmptyState } from "@/components/empty/GlobalEmptyState";
import { SavedViews } from "@/components/pipeline/SavedViews";
import { SlaBanner } from "@/components/pipeline/SlaBanner";
import { usePipelineStore } from "@/store/usePipelineStore";
import { CANDIDATES } from "@/lib/data";
import type { CandidateSortDir, CandidateSortKey, DensityMode, FilterState, Stage, ViewMode } from "@/types";

const VALID_SORT_KEYS: CandidateSortKey[] = ["name", "experience", "matchScore", "lastActivity"];

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0f1a] md:h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydratedRef = useRef(false);
  const {
    initCandidates,
    setLoading,
    viewMode,
    candidates,
    isLoading,
    filters,
    sortKey,
    sortDir,
    density,
    setAllFilters,
    setViewMode,
    setSort,
    setDensity,
  } = usePipelineStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      initCandidates(CANDIDATES);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [initCandidates, setLoading]);

  useEffect(() => {
    if (typeof window === "undefined" || hydratedRef.current) return;
    hydratedRef.current = true;

    try {
      const storedSidebar = window.localStorage.getItem("tf_sidebar");
      if (storedSidebar) setSidebarCollapsed(storedSidebar !== "expanded");
    } catch {}

    const nextFilters: FilterState = {
      search: searchParams.get("search") ?? "",
      stages: (searchParams.get("stages")?.split(",").filter(Boolean) ?? []) as Stage[],
      experienceBracket: (searchParams.get("exp") as FilterState["experienceBracket"]) ?? "Any",
      scoreRange: (searchParams.get("score") as FilterState["scoreRange"]) ?? "Any",
      staleOnly: searchParams.get("stale") === "true",
      tags: (searchParams.get("tags")?.split(",").filter(Boolean) ?? []) as FilterState["tags"],
    };
    setAllFilters(nextFilters);

    const urlView = searchParams.get("view") as ViewMode | null;
    if (urlView === "board" || urlView === "list") {
      setViewMode(urlView);
    } else {
      try {
        const storedView = window.localStorage.getItem("tf_viewmode") as ViewMode | null;
        if (storedView === "board" || storedView === "list") setViewMode(storedView);
        const storedDensity = window.localStorage.getItem("tf_density") as DensityMode | null;
        if (storedDensity === "compact" || storedDensity === "comfortable" || storedDensity === "spacious") {
          setDensity(storedDensity);
        }
      } catch {}
    }

    const nextSortKey = searchParams.get("sort") as CandidateSortKey | null;
    const nextSortDir = searchParams.get("sortDir") as CandidateSortDir | null;
    if (
      nextSortKey &&
      VALID_SORT_KEYS.includes(nextSortKey) &&
      (nextSortDir === "asc" || nextSortDir === "desc")
    ) {
      setSort(nextSortKey, nextSortDir);
    }
  }, [searchParams, setAllFilters, setDensity, setSort, setViewMode]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.stages.length > 0) params.set("stages", filters.stages.join(","));
    if (filters.experienceBracket !== "Any") params.set("exp", filters.experienceBracket);
    if (filters.scoreRange !== "Any") params.set("score", filters.scoreRange);
    if (filters.staleOnly) params.set("stale", "true");
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    params.set("view", viewMode);
    params.set("sort", sortKey);
    params.set("sortDir", sortDir);
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    }

    try {
      window.localStorage.setItem("tf_viewmode", viewMode);
      window.localStorage.setItem("tf_sidebar", sidebarCollapsed ? "collapsed" : "expanded");
      window.localStorage.setItem("tf_density", density);
    } catch {}
  }, [density, filters, pathname, router, searchParams, sidebarCollapsed, sortDir, sortKey, viewMode]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#0c0f1a] md:h-screen md:overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div id="main-content" className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden md:overflow-hidden">
        <Header onMobileMenu={() => setIsMobileMenuOpen(true)} />
        <JobOverview />
        <InsightsStrip />
        <SlaBanner />

        <div className="flex flex-1 flex-col overflow-visible md:min-h-0 md:overflow-hidden">
          {!isLoading && candidates.length === 0 ? (
            <GlobalEmptyState />
          ) : (
            <>
              <SavedViews />
              <FilterBar />
              {viewMode === "board" ? <KanbanBoard /> : <CandidateTable />}
            </>
          )}
        </div>
      </div>

      <CandidateDrawer />
      <BulkActionBar />
      <NewCandidateModal />
    </div>
  );
}
