
"use client";

import { create } from "zustand";
import type { Candidate, FilterState, Stage, ViewMode } from "@/types";

// We import lazily so the store file itself is pure
// — data is injected via initCandidates() below
const DEFAULT_FILTERS: FilterState = {
  search: "",
  stages: [],
  experienceBracket: "Any",
  scoreRange: "Any",
};

interface Store {
  /* state */
  candidates:              Candidate[];
  viewMode:                ViewMode;
  filters:                 FilterState;
  selectedCandidate:       Candidate | null;
  isDrawerOpen:            boolean;
  isLoading:               boolean;
  selectedIds:             Set<string>;
  isNewCandidateModalOpen: boolean;

  /* actions */
  initCandidates:          (data: Candidate[]) => void;
  setViewMode:             (m: ViewMode) => void;
  setFilters:              (p: Partial<FilterState>) => void;
  clearFilters:            () => void;
  selectCandidate:         (c: Candidate) => void;
  closeDrawer:             () => void;
  moveCandidate:           (id: string, stage: Stage) => void;
  addNote:                 (candidateId: string, content: string) => void;
  toggleSelectId:          (id: string) => void;
  selectAll:               (ids: string[]) => void;
  clearSelection:          () => void;
  bulkMove:                (stage: Stage) => void;
  addCandidate:            (c: Candidate) => void;
  setNewCandidateModalOpen:(open: boolean) => void;
  setLoading:              (v: boolean) => void;
}

export const usePipelineStore = create<Store>((set, get) => ({
  candidates:              [],
  viewMode:                "board",
  filters:                 DEFAULT_FILTERS,
  selectedCandidate:       null,
  isDrawerOpen:            false,
  isLoading:               true,
  selectedIds:             new Set(),
  isNewCandidateModalOpen: false,

  initCandidates: (data) => set({ candidates: data }),

  setViewMode:  (viewMode)  => set({ viewMode }),
  setFilters:   (p)         => set((s) => ({ filters: { ...s.filters, ...p } })),
  clearFilters: ()          => set({ filters: DEFAULT_FILTERS }),

  selectCandidate: (c)  => set({ selectedCandidate: c, isDrawerOpen: true }),
  closeDrawer:     ()   => set({ isDrawerOpen: false, selectedCandidate: null }),

  moveCandidate: (id, stage) =>
    set((s) => ({
      candidates: s.candidates.map((c) =>
        c.id !== id ? c : {
          ...c,
          stage,
          lastActivity: new Date().toISOString(),
          timeline: [
            ...c.timeline,
            {
              id: `t${Date.now()}`,
              stage,
              date: new Date().toISOString(),
              actor: "Priya Sharma",
              note: `Moved to ${stage}`,
            },
          ],
        }
      ),
      selectedCandidate:
        s.selectedCandidate?.id === id
          ? { ...s.selectedCandidate, stage, lastActivity: new Date().toISOString() }
          : s.selectedCandidate,
    })),

  addNote: (candidateId, content) => {
    const note = {
      id:             `note-${Date.now()}`,
      author:         "Priya Sharma",
      authorInitials: "PS",
      content,
      createdAt:      new Date().toISOString(),
    };
    set((s) => ({
      candidates: s.candidates.map((c) =>
        c.id === candidateId ? { ...c, notes: [...c.notes, note] } : c
      ),
      selectedCandidate:
        s.selectedCandidate?.id === candidateId
          ? { ...s.selectedCandidate, notes: [...s.selectedCandidate.notes, note] }
          : s.selectedCandidate,
    }));
  },

  toggleSelectId: (id) => {
    const next = new Set(get().selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    set({ selectedIds: next });
  },
  selectAll:     (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: ()   => set({ selectedIds: new Set() }),

  bulkMove: (stage) => {
    const { selectedIds } = get();
    set((s) => ({
      candidates: s.candidates.map((c) =>
        selectedIds.has(c.id)
          ? { ...c, stage, lastActivity: new Date().toISOString() }
          : c
      ),
      selectedIds: new Set(),
    }));
  },

  addCandidate: (c) => set((s) => ({ candidates: [c, ...s.candidates] })),

  setNewCandidateModalOpen: (open)    => set({ isNewCandidateModalOpen: open }),
  setLoading:               (isLoading) => set({ isLoading }),
}));