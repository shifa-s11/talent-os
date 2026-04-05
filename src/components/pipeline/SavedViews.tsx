"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { usePipelineStore } from "@/store/usePipelineStore";
import { countActiveFilters, daysInStage, filterCandidates, hasActiveFilters } from "@/lib/utils";
import type { FilterState } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface SavedView {
  name: string;
  filters: FilterState;
}

const BUILT_INS: SavedView[] = [
  { name: "High match", filters: { search: "", stages: [], experienceBracket: "Any", scoreRange: "80-100", staleOnly: false, tags: [] } },
  { name: "Needs review", filters: { search: "", stages: ["Applied"], experienceBracket: "Any", scoreRange: "Any", staleOnly: false, tags: [] } },
  { name: "Interview this week", filters: { search: "", stages: ["Interview"], experienceBracket: "Any", scoreRange: "Any", staleOnly: false, tags: [] } },
  { name: "Stale candidates", filters: { search: "", stages: [], experienceBracket: "Any", scoreRange: "Any", staleOnly: true, tags: [] } },
];

export function SavedViews() {
  const { candidates, filters, setAllFilters, clearFilters } = usePipelineStore();
  const [userViews, setUserViews] = useState<SavedView[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("tf_saved_views");
      if (stored) setUserViews(JSON.parse(stored) as SavedView[]);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("tf_saved_views", JSON.stringify(userViews));
    } catch {}
  }, [userViews]);

  const allViews = [...BUILT_INS, ...userViews];

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    BUILT_INS.forEach((view) => {
      const result = view.name === "Stale candidates"
        ? candidates.filter((candidate) => daysInStage(candidate) >= 5).length
        : filterCandidates(candidates, view.filters).length;
      map.set(view.name, result);
    });
    userViews.forEach((view) => map.set(view.name, filterCandidates(candidates, view.filters).length));
    return map;
  }, [candidates, userViews]);

  const currentFilterKey = JSON.stringify(filters);

  const saveCurrentView = () => {
    if (!hasActiveFilters(filters)) return;
    if (userViews.length >= 5) {
      showToast({ message: "Max 5 saved views", type: "warning" });
      return;
    }
    const name = `Saved view ${userViews.length + 1}`;
    setUserViews((current) => [...current, { name, filters }]);
    showToast({ message: `${name} saved`, type: "success" });
  };

  return (
    <div className="px-4 sm:px-5 pt-1.5 pb-1">
      <div className="flex items-center gap-2 overflow-x-auto">
        {allViews.map((view) => {
          const active = JSON.stringify(view.filters) === currentFilterKey;
          return (
            <div key={view.name} className="relative flex items-center">
              <button
                onClick={() => {
                  clearFilters();
                  setAllFilters(view.filters);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all duration-200 ${
                  active
                    ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
                    : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/[0.16] hover:text-white"
                }`}
              >
                {view.name}
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold">
                  {counts.get(view.name) ?? 0}
                </span>
              </button>
              {!BUILT_INS.find((builtIn) => builtIn.name === view.name) && (
                <button
                  onClick={() => setUserViews((current) => current.filter((item) => item.name !== view.name))}
                  aria-label={`Delete saved view ${view.name}`}
                  className="ml-1 rounded-full p-1 text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={saveCurrentView}
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition-all duration-200 hover:border-white/[0.16] hover:text-white focus-visible:border-white/[0.16] focus-visible:text-white"
        >
          + Save current view
        </button>
        {countActiveFilters(filters) === 0 && (
          <span className="text-xs text-slate-600">Apply filters to save a view.</span>
        )}
      </div>
    </div>
  );
}
