"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Mail, MapPin,
  GraduationCap, Calendar,
  ArrowRight, XCircle, Clock,
  MessageSquare, Send, CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { usePipelineStore } from "@/store/usePipelineStore";
import { Avatar } from "@/components/ui/Avatar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { InterviewStatus } from "./InterviewStatus";
import { NextBestAction } from "./NextBestAction";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useToast } from "@/components/ui/Toast";
import {
  cn,
  TAG_COLORS,
  STAGES,
  STAGE_CONFIG,
  formatDate,
  formatRelativeTime,
} from "@/lib/utils";
import type { Stage } from "@/types";

type Tab = "profile" | "timeline" | "notes";

function Linkedin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.5a1.56 1.56 0 1 1 0-3.12 1.56 1.56 0 0 1 0 3.12ZM5.5 9.75h2.88V18H5.5V9.75Zm4.63 0h2.76v1.13h.04c.38-.73 1.32-1.5 2.72-1.5 2.9 0 3.43 1.91 3.43 4.39V18H16.2v-3.74c0-.89-.02-2.03-1.24-2.03-1.24 0-1.43.97-1.43 1.97V18h-2.9V9.75Z" />
    </svg>
  );
}

const TIMELINE_RING: Record<Stage | "reject" | "interview", string> = {
  Applied: "border-blue-500 bg-blue-500/20 text-blue-400",
  Shortlisted: "border-violet-500 bg-violet-500/20 text-violet-400",
  Interview: "border-amber-500 bg-amber-500/20 text-amber-400",
  Offered: "border-cyan-500 bg-cyan-500/20 text-cyan-400",
  Hired: "border-emerald-500 bg-emerald-500/20 text-emerald-400",
  reject: "border-rose-500 bg-rose-500/20 text-rose-400",
  interview: "border-amber-500 bg-amber-500/20 text-amber-400",
};

const INPUT_CLS =
  "w-full bg-[#0c0f1a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]";

export function CandidateDrawer() {
  const {
    selectedCandidate,
    isDrawerOpen,
    closeDrawer,
    moveCandidate,
    addNote,
    addTag,
    rejectCandidate,
    removeTag,
    scheduleInterview,
  } = usePipelineStore();
  const { showToast } = useToast();

  const drawerRef = useRef<HTMLDivElement>(null);
  const schedulePanelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scheduleDateRef = useRef<HTMLInputElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const restoreFocusTimeoutRef = useRef<number | null>(null);
  const noteSavedTimeoutRef = useRef<number | null>(null);

  const [tab, setTab] = useState<Tab>("profile");
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRejectConfirming, setIsRejectConfirming] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "10:00",
    interviewer: "Priya Sharma",
    notes: "",
  });

  useFocusTrap(drawerRef, isDrawerOpen, () => closeWithFocusRestore());
  useFocusTrap(schedulePanelRef, isScheduleOpen, () => setIsScheduleOpen(false));

  useEffect(() => {
    if (isDrawerOpen) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      const mountTimeout = window.setTimeout(() => {
        setMounted(true);
        closeButtonRef.current?.focus();
      }, 10);
      return () => window.clearTimeout(mountTimeout);
    }
    setMounted(false);
    return undefined;
  }, [isDrawerOpen]);

  useEffect(() => {
    setTab("profile");
    setNote("");
    setStageOpen(false);
    setIsRejectConfirming(false);
    setIsScheduleOpen(false);
    setScheduleForm({
      date: new Date().toISOString().slice(0, 10),
      time: "10:00",
      interviewer: "Priya Sharma",
      notes: "",
    });
  }, [selectedCandidate?.id]);

  useEffect(() => {
    if (!isScheduleOpen) return undefined;
    const timeout = window.setTimeout(() => scheduleDateRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [isScheduleOpen]);

  useEffect(() => {
    return () => {
      if (restoreFocusTimeoutRef.current) window.clearTimeout(restoreFocusTimeoutRef.current);
      if (noteSavedTimeoutRef.current) window.clearTimeout(noteSavedTimeoutRef.current);
    };
  }, []);

  if (!isDrawerOpen || !selectedCandidate) return null;

  const candidate = selectedCandidate;
  const config = STAGE_CONFIG[candidate.stage];
  const availableTags = ["Referral", "Immediate Joiner", "Notice Period", "Design System Fit", "Ex-FAANG", "Open Source", "Requires Relocation", "Negotiating"].filter(
    (tag) => !candidate.tags.includes(tag as typeof candidate.tags[number]),
  ) as typeof candidate.tags;

  const closeWithFocusRestore = () => {
    closeDrawer();
    restoreFocusTimeoutRef.current = window.setTimeout(() => {
      previousActiveRef.current?.focus();
    }, 280);
  };

  const handleSaveNote = () => {
    if (!note.trim()) return;
    addNote(candidate.id, note.trim());
    setNote("");
    setNoteSaved(true);
    showToast({ message: "Note saved", type: "success" });
    noteSavedTimeoutRef.current = window.setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleMove = (stage: Stage) => {
    moveCandidate(candidate.id, stage);
    setStageOpen(false);
  };

  const handleReject = () => {
    rejectCandidate(candidate.id);
    setIsRejectConfirming(false);
  };

  const handleScheduleInterview = () => {
    if (!scheduleForm.date || !scheduleForm.time || !scheduleForm.interviewer.trim()) return;
    scheduleInterview(candidate.id, {
      date: scheduleForm.date,
      time: scheduleForm.time,
      interviewer: scheduleForm.interviewer.trim(),
      notes: scheduleForm.notes.trim(),
    });
    setIsScheduleOpen(false);
    showToast({ message: `Interview scheduled for ${candidate.name}`, type: "success" });
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-all duration-200",
          mounted ? "opacity-100" : "opacity-0",
        )}
        onClick={closeWithFocusRestore}
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${candidate.name} candidate details`}
        className={cn(
          "drawer-panel fixed top-0 right-0 h-full z-50",
          "w-full sm:w-[420px] lg:w-[460px]",
          "bg-[#111827] border-l border-white/[0.07]",
          "flex flex-col overflow-hidden",
          "shadow-2xl shadow-black/60",
          "transition-all duration-200 ease-out",
          mounted ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-white/[0.06] flex-shrink-0">
          <Avatar initials={candidate.initials} gradient={candidate.avatarColor} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-[15px] font-display font-semibold text-white leading-snug truncate">
                  {candidate.name}
                </h2>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {candidate.currentRole}
                  <span className="text-slate-700"> · </span>
                  {candidate.currentCompany}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={closeWithFocusRestore}
                className="p-1.5 rounded-lg hover:bg-white/[0.07] focus-visible:bg-white/[0.07] text-slate-500 hover:text-white focus-visible:text-white transition-all duration-200 flex-shrink-0 active:scale-[0.98]"
                aria-label="Close candidate drawer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ScoreBadge score={candidate.matchScore} bar />
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
                  config.bg,
                  config.text,
                  config.border,
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                {candidate.stage}
              </span>
              <span className="text-[10px] text-slate-600 flex items-center gap-1">
                <Clock size={9} />
                {formatRelativeTime(candidate.lastActivity)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-white/[0.06] flex-shrink-0 px-5">
          {(["profile", "timeline", "notes"] as Tab[]).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={cn(
                "relative py-3 px-1 mr-5 text-[12px] font-semibold capitalize transition-all duration-200",
                tab === value
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300 focus-visible:text-slate-300",
              )}
            >
              {value}
              {value === "notes" && candidate.notes.length > 0 && (
                <span className="ml-1.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {candidate.notes.length}
                </span>
              )}
              {tab === value && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "profile" && (
            <div className="p-5 space-y-5 animate-fadeIn">
              <div>
                <SectionLabel>Summary</SectionLabel>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  {candidate.summary || "No summary added yet."}
                </p>
              </div>

              <div>
                <SectionLabel>Skills</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.length > 0 ? candidate.skills.map((skill) => (
                    <span
                      key={skill.label}
                      className={cn(
                        "text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/[0.08]",
                        skill.color,
                      )}
                    >
                      {skill.label}
                    </span>
                  )) : (
                    <span className="text-[12px] text-slate-500">No skills tagged yet.</span>
                  )}
                </div>
              </div>

              <div>
                <SectionLabel>Tags</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags.map((tag) => (
                    <span key={tag} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]", TAG_COLORS[tag])}>
                      {tag}
                      <button
                        onClick={() => removeTag(candidate.id, tag)}
                        aria-label={`Remove tag ${tag}`}
                        className="rounded-full p-0.5 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {availableTags.length > 0 && (
                    <details className="relative">
                      <summary className="list-none cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300 transition-all duration-200 hover:border-white/[0.16] hover:text-white">
                        + Add tag
                      </summary>
                      <div className="absolute left-0 top-8 z-20 min-w-[180px] rounded-xl border border-white/[0.08] bg-[#111827] p-2 shadow-xl shadow-black/40 animate-scaleIn">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => addTag(candidate.id, tag)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>

              <InterviewStatus
                candidate={candidate}
                onSchedule={() => setIsScheduleOpen(true)}
              />

              <div>
                <SectionLabel>Contact</SectionLabel>
                <div className="space-y-2">
                  <ContactRow icon={Mail} label={candidate.email} href={`mailto:${candidate.email}`} />
                  {candidate.linkedIn && (
                    <ContactRow icon={Linkedin} label={candidate.linkedIn} href={`https://${candidate.linkedIn}`} />
                  )}
                  <ContactRow icon={MapPin} label={candidate.location || "Location unavailable"} />
                </div>
              </div>

              <div>
                <SectionLabel>Education</SectionLabel>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GraduationCap size={13} className="text-indigo-400" />
                  </div>
                  <p className="text-[13px] text-slate-300 leading-relaxed">
                    {candidate.education || "Education not provided."}
                  </p>
                </div>
              </div>

              <div>
                <SectionLabel>Experience</SectionLabel>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar size={13} className="text-amber-400" />
                  </div>
                  <p className="text-[13px] text-slate-300">{candidate.experience} years of experience</p>
                </div>
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div className="p-5 animate-fadeIn">
              <SectionLabel>Activity Timeline</SectionLabel>
              <div className="relative mt-3">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.06]" />
                <div className="space-y-5">
                  {[...candidate.timeline].reverse().map((event) => {
                    const iconKey = event.icon ?? event.stage ?? "interview";
                    const ringClass = TIMELINE_RING[iconKey];
                    return (
                      <div key={event.id} className="flex gap-3.5 relative">
                        <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10", ringClass)}>
                          <div className="w-2 h-2 rounded-full bg-current opacity-70" />
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-[13px] font-semibold text-slate-200">{event.event ?? event.stage ?? "Activity"}</p>
                            <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">{formatDate(event.date)}</span>
                          </div>
                          {(event.description || event.note) && (
                            <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                              {event.description ?? event.note}
                            </p>
                          )}
                          {event.actor && <p className="text-[11px] text-slate-600 mt-1">by {event.actor}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "notes" && (
            <div className="p-5 space-y-4 animate-fadeIn">
              {candidate.notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <MessageSquare size={16} className="text-slate-600" />
                  </div>
                  <p className="text-[12px] text-slate-600 text-center">No notes yet. Add the first one below.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidate.notes.map((entry) => (
                    <div key={entry.id} className="bg-[#1a2236] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                            {entry.authorInitials}
                          </div>
                          <span className="text-[12px] font-semibold text-slate-300">{entry.author}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {formatRelativeTime(entry.createdAt)}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-400 leading-relaxed">{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all duration-200">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a note about this candidate..."
                  rows={3}
                  className="w-full bg-[#1a2236] text-[13px] text-slate-300 placeholder-slate-600 resize-none outline-none p-3.5 leading-relaxed"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) handleSaveNote();
                  }}
                />
                <div className="bg-[#1a2236] border-t border-white/[0.06] px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600">Ctrl/Cmd + Enter to save</span>
                  <button
                    onClick={handleSaveNote}
                    disabled={!note.trim()}
                    className={cn(
                      "flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200",
                      note.trim()
                        ? "bg-indigo-600 hover:bg-indigo-500 focus-visible:bg-indigo-500 text-white active:scale-[0.98]"
                        : "bg-white/[0.04] text-slate-600 cursor-not-allowed",
                    )}
                  >
                    {noteSaved ? <><CheckCircle2 size={12} /> Saved!</> : <><Send size={12} /> Save Note</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.06] px-5 py-4 flex flex-col gap-3 flex-shrink-0 bg-[#111827]">
          <NextBestAction
            candidate={candidate}
            onSchedule={() => setIsScheduleOpen(true)}
            onMove={() => {
              const currentIndex = STAGES.indexOf(candidate.stage);
              const nextStage = STAGES[Math.min(currentIndex + 1, STAGES.length - 1)];
              if (nextStage !== candidate.stage) moveCandidate(candidate.id, nextStage);
            }}
            onFollowUp={() => showToast({ message: `Follow-up reminder set for ${candidate.name}`, type: "info" })}
          />

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsScheduleOpen((value) => !value)}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 focus-visible:bg-indigo-500 text-white text-[12px] font-semibold px-3 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
            >
              <Calendar size={13} />
              Schedule Interview
            </button>

            <div className="relative">
              <button
                onClick={() => setStageOpen((value) => !value)}
                className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] focus-visible:bg-white/[0.1] text-slate-300 hover:text-white focus-visible:text-white text-[12px] font-semibold px-3 py-2 rounded-lg transition-all duration-200 border border-white/[0.08] hover:border-white/[0.16] focus-visible:border-white/[0.16] active:scale-[0.98]"
              >
                <ArrowRight size={13} />
                Move Stage
                <ChevronDown size={11} className={cn("transition-all duration-200", stageOpen && "rotate-180")} />
              </button>

              {stageOpen && (
                <div className="absolute bottom-full mb-2 left-0 min-w-[160px] bg-[#1e2a40] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/60 py-1.5 z-10 animate-scaleIn transition-all duration-200">
                  <p className="text-[9px] text-slate-600 px-3 pb-1 uppercase tracking-widest font-semibold">
                    Move to stage
                  </p>
                  {STAGES.filter((stage) => stage !== candidate.stage).map((stage) => {
                    const stageConfig = STAGE_CONFIG[stage];
                    return (
                      <button
                        key={stage}
                        onClick={() => handleMove(stage)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-white/[0.06] focus-visible:bg-white/[0.06] hover:text-white focus-visible:text-white transition-all duration-200"
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", stageConfig.dot)} />
                        {stage}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {isRejectConfirming ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] text-rose-300">Are you sure?</span>
                <button
                  onClick={handleReject}
                  className="text-[12px] font-semibold px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 focus-visible:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all duration-200 active:scale-[0.98]"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setIsRejectConfirming(false)}
                  className="text-[12px] font-semibold px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] focus-visible:bg-white/[0.1] text-slate-300 transition-all duration-200 active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsRejectConfirming(true)}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 focus-visible:text-rose-300 text-[12px] font-semibold px-3 py-2 rounded-lg border border-rose-500/30 hover:border-rose-400/50 focus-visible:border-rose-400/50 hover:bg-rose-500/[0.08] focus-visible:bg-rose-500/[0.08] transition-all duration-200 active:scale-[0.98]"
              >
                <XCircle size={13} />
                Reject
              </button>
            )}
          </div>

          {isScheduleOpen && (
            <div
              ref={schedulePanelRef}
              className="bg-[#1a2236] border border-white/[0.08] rounded-xl p-4 space-y-3 animate-scaleIn transition-all duration-200"
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input
                    ref={scheduleDateRef}
                    type="date"
                    value={scheduleForm.date}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Time">
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(event) => setScheduleForm((current) => ({ ...current, time: event.target.value }))}
                    className={INPUT_CLS}
                  />
                </Field>
              </div>

              <Field label="Interviewer">
                <input
                  type="text"
                  value={scheduleForm.interviewer}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, interviewer: event.target.value }))}
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Notes">
                <textarea
                  rows={3}
                  value={scheduleForm.notes}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, notes: event.target.value }))}
                  className={cn(INPUT_CLS, "resize-none")}
                  placeholder="Add optional interview notes"
                />
              </Field>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsScheduleOpen(false)}
                  className="text-[12px] font-semibold px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] focus-visible:bg-white/[0.1] text-slate-300 transition-all duration-200 active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  className="text-[12px] font-semibold px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 focus-visible:bg-indigo-500 text-white transition-all duration-200 active:scale-[0.98]"
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
      {children}
    </p>
  );
}

function ContactRow({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
}) {
  const className = cn(
    "flex items-center gap-2.5 text-[12px] transition-all duration-200",
    href
      ? "text-indigo-400 hover:text-indigo-300 focus-visible:text-indigo-300 cursor-pointer"
      : "text-slate-400 cursor-default",
  );
  const content = (
    <>
      <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
        <Icon size={11} className="text-slate-500" />
      </div>
      <span className="truncate">{label}</span>
    </>
  );

  return href
    ? <a href={href} target="_blank" rel="noreferrer" className={className}>{content}</a>
    : <div className={className}>{content}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
