"use client";

import { create } from "zustand";
import type {
  Candidate,
  CandidateSortDir,
  CandidateSortKey,
  CandidateTag,
  DensityMode,
  FilterState,
  Stage,
  TimelineEvent,
  ViewMode,
} from "@/types";
import { hasActiveFilters as computeHasActiveFilters } from "@/lib/utils";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  stages: [],
  experienceBracket: "Any",
  scoreRange: "Any",
  staleOnly: false,
  tags: [],
};

interface PipelineStore {
  candidates: Candidate[];
  viewMode: ViewMode;
  filters: FilterState;
  sortKey: CandidateSortKey;
  sortDir: CandidateSortDir;
  density: DensityMode;
  selectedCandidate: Candidate | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  selectedIds: Set<string>;
  isNewCandidateModalOpen: boolean;
  newCandidateStagePrefill: Stage | null;
  undoSnapshot: Candidate[] | null;

  initCandidates: (data: Candidate[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (partial: Partial<FilterState>) => void;
  setAllFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
  setSort: (sortKey: CandidateSortKey, sortDir: CandidateSortDir) => void;
  setDensity: (density: DensityMode) => void;
  selectCandidate: (candidate: Candidate) => void;
  closeDrawer: () => void;
  moveCandidate: (id: string, stage: Stage) => void;
  addNote: (candidateId: string, content: string) => void;
  toggleSelectId: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  bulkMove: (stage: Stage) => void;
  addCandidate: (candidate: Candidate) => void;
  setNewCandidateModalOpen: (open: boolean) => void;
  openNewCandidateModal: (stage?: Stage) => void;
  setLoading: (value: boolean) => void;
  rejectCandidate: (id: string) => void;
  scheduleInterview: (id: string, payload: {
    date: string;
    time: string;
    interviewer: string;
    notes: string;
  }) => void;
  addTag: (candidateId: string, tag: CandidateTag) => void;
  removeTag: (candidateId: string, tag: CandidateTag) => void;
  restoreSnapshot: () => void;
}

function cloneCandidates(candidates: Candidate[]): Candidate[] {
  return candidates.map((candidate) => ({
    ...candidate,
    skills: [...candidate.skills],
    tags: [...candidate.tags],
    timeline: [...candidate.timeline],
    notes: [...candidate.notes],
  }));
}

function makeStageEvent(stage: Stage, note: string, idSuffix = ""): TimelineEvent {
  const now = new Date().toISOString();
  return {
    id: `t-${Date.now()}${idSuffix}`,
    stage,
    date: now,
    actor: "Priya Sharma",
    note,
    event: `Moved to ${stage}`,
    description: note,
    icon: stage,
  };
}

function makeRejectedEvent(): TimelineEvent {
  return {
    id: `t-${Date.now()}-reject`,
    date: new Date().toISOString(),
    actor: "Priya Sharma",
    event: "Rejected",
    description: "Candidate marked as rejected",
    note: "Candidate marked as rejected",
    icon: "reject",
  };
}

function makeInterviewScheduledEvent(payload: {
  date: string;
  time: string;
  interviewer: string;
  notes: string;
}): TimelineEvent {
  const baseDescription = `${payload.date} at ${payload.time} with ${payload.interviewer}`;
  return {
    id: `t-${Date.now()}-interview`,
    stage: "Interview",
    date: new Date().toISOString(),
    actor: payload.interviewer,
    event: "Interview Scheduled",
    description: payload.notes.trim()
      ? `${baseDescription}. ${payload.notes.trim()}`
      : baseDescription,
    note: payload.notes.trim() || baseDescription,
    icon: "interview",
  };
}

function withSnapshot(state: PipelineStore) {
  return { undoSnapshot: cloneCandidates(state.candidates) };
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  candidates: [],
  viewMode: "board",
  filters: DEFAULT_FILTERS,
  sortKey: "matchScore",
  sortDir: "desc",
  density: "comfortable",
  selectedCandidate: null,
  isDrawerOpen: false,
  isLoading: true,
  selectedIds: new Set(),
  isNewCandidateModalOpen: false,
  newCandidateStagePrefill: null,
  undoSnapshot: null,

  initCandidates: (data) => set({ candidates: data }),
  setViewMode: (viewMode) => set({ viewMode }),
  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  setAllFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  hasActiveFilters: () => computeHasActiveFilters(get().filters),
  setSort: (sortKey, sortDir) => set({ sortKey, sortDir }),
  setDensity: (density) => set({ density }),

  selectCandidate: (candidate) => set({ selectedCandidate: candidate, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedCandidate: null }),

  moveCandidate: (id, stage) =>
    set((state) => {
      const snapshot = withSnapshot(state);
      let updatedCandidate: Candidate | null = null;
      const timelineEvent = makeStageEvent(stage, `Moved to ${stage}`);
      const candidates = state.candidates.map((candidate) => {
        if (candidate.id !== id) return candidate;
        updatedCandidate = {
          ...candidate,
          stage,
          lastActivity: timelineEvent.date,
          timeline: [...candidate.timeline, timelineEvent],
        };
        return updatedCandidate;
      });
      return {
        ...snapshot,
        candidates,
        selectedCandidate: state.selectedCandidate?.id === id ? updatedCandidate : state.selectedCandidate,
      };
    }),

  addNote: (candidateId, content) =>
    set((state) => {
      const note = {
        id: `note-${Date.now()}`,
        author: "Priya Sharma",
        authorInitials: "PS",
        content,
        createdAt: new Date().toISOString(),
      };
      return {
        candidates: state.candidates.map((candidate) =>
          candidate.id === candidateId ? { ...candidate, notes: [...candidate.notes, note] } : candidate,
        ),
        selectedCandidate:
          state.selectedCandidate?.id === candidateId
            ? { ...state.selectedCandidate, notes: [...state.selectedCandidate.notes, note] }
            : state.selectedCandidate,
      };
    }),

  toggleSelectId: (id) => {
    const next = new Set(get().selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedIds: next });
  },
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  bulkMove: (stage) =>
    set((state) => {
      const snapshot = withSnapshot(state);
      const updatedById = new Map<string, Candidate>();
      const candidates = state.candidates.map((candidate) => {
        if (!state.selectedIds.has(candidate.id)) return candidate;
        const timelineEvent: TimelineEvent = {
          id: `t-${Date.now()}-${candidate.id}`,
          stage,
          date: new Date().toISOString(),
          actor: "Priya Sharma",
          event: `Moved to ${stage}`,
          description: "Stage updated via bulk action",
          note: "Stage updated via bulk action",
          icon: stage,
        };
        const nextCandidate = {
          ...candidate,
          stage,
          lastActivity: timelineEvent.date,
          timeline: [...candidate.timeline, timelineEvent],
        };
        updatedById.set(candidate.id, nextCandidate);
        return nextCandidate;
      });

      return {
        ...snapshot,
        candidates,
        selectedCandidate:
          state.selectedCandidate && updatedById.has(state.selectedCandidate.id)
            ? updatedById.get(state.selectedCandidate.id) ?? state.selectedCandidate
            : state.selectedCandidate,
        selectedIds: new Set(),
      };
    }),

  addCandidate: (candidate) =>
    set((state) => ({
      ...withSnapshot(state),
      candidates: [candidate, ...state.candidates],
    })),

  setNewCandidateModalOpen: (open) =>
    set({ isNewCandidateModalOpen: open, newCandidateStagePrefill: open ? get().newCandidateStagePrefill : null }),
  openNewCandidateModal: (stage) => set({ isNewCandidateModalOpen: true, newCandidateStagePrefill: stage ?? null }),
  setLoading: (isLoading) => set({ isLoading }),

  rejectCandidate: (id) =>
    set((state) => {
      const snapshot = withSnapshot(state);
      let updatedCandidate: Candidate | null = null;
      const timelineEvent = makeRejectedEvent();
      const candidates = state.candidates.map((candidate) => {
        if (candidate.id !== id) return candidate;
        updatedCandidate = {
          ...candidate,
          status: "Rejected",
          lastActivity: timelineEvent.date,
          timeline: [...candidate.timeline, timelineEvent],
        };
        return updatedCandidate;
      });
      return {
        ...snapshot,
        candidates,
        selectedCandidate: state.selectedCandidate?.id === id ? updatedCandidate : state.selectedCandidate,
      };
    }),

  scheduleInterview: (id, payload) =>
    set((state) => {
      const snapshot = withSnapshot(state);
      let updatedCandidate: Candidate | null = null;
      const timelineEvent = makeInterviewScheduledEvent(payload);
      const candidates = state.candidates.map((candidate) => {
        if (candidate.id !== id) return candidate;
        updatedCandidate = {
          ...candidate,
          stage: "Interview",
          lastActivity: timelineEvent.date,
          timeline: [...candidate.timeline, timelineEvent],
        };
        return updatedCandidate;
      });
      return {
        ...snapshot,
        candidates,
        selectedCandidate: state.selectedCandidate?.id === id ? updatedCandidate : state.selectedCandidate,
      };
    }),

  addTag: (candidateId, tag) =>
    set((state) => ({
      candidates: state.candidates.map((candidate) =>
        candidate.id === candidateId && !candidate.tags.includes(tag)
          ? { ...candidate, tags: [...candidate.tags, tag] }
          : candidate,
      ),
      selectedCandidate:
        state.selectedCandidate?.id === candidateId && !state.selectedCandidate.tags.includes(tag)
          ? { ...state.selectedCandidate, tags: [...state.selectedCandidate.tags, tag] }
          : state.selectedCandidate,
    })),

  removeTag: (candidateId, tag) =>
    set((state) => ({
      candidates: state.candidates.map((candidate) =>
        candidate.id === candidateId
          ? { ...candidate, tags: candidate.tags.filter((item) => item !== tag) }
          : candidate,
      ),
      selectedCandidate:
        state.selectedCandidate?.id === candidateId
          ? { ...state.selectedCandidate, tags: state.selectedCandidate.tags.filter((item) => item !== tag) }
          : state.selectedCandidate,
    })),

  restoreSnapshot: () =>
    set((state) => ({
      candidates: state.undoSnapshot ? cloneCandidates(state.undoSnapshot) : state.candidates,
      selectedCandidate:
        state.undoSnapshot && state.selectedCandidate
          ? cloneCandidates(state.undoSnapshot).find((candidate) => candidate.id === state.selectedCandidate?.id) ?? null
          : state.selectedCandidate,
      undoSnapshot: null,
    })),
}));
