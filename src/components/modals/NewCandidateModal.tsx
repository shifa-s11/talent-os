"use client";

import { useEffect, useRef, useState } from "react";
import { X, UserPlus, CheckCircle2 } from "lucide-react";
import { usePipelineStore } from "@/store/usePipelineStore";
import { cn, expBracket } from "@/lib/utils";
import type { Stage } from "@/types";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
];

const INPUT_CLS = cn(
  "w-full bg-[#0c0f1a] border border-white/[0.08] rounded-lg",
  "px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600",
  "outline-none transition-all duration-200",
  "focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]",
);

const LABEL_CLS = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

export function NewCandidateModal() {
  const {
    isNewCandidateModalOpen,
    setNewCandidateModalOpen,
    addCandidate,
    newCandidateStagePrefill,
  } = usePipelineStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    experience: "",
    stage: "Applied" as Stage,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  useFocusTrap(modalRef, isNewCandidateModalOpen, () => setNewCandidateModalOpen(false));

  useEffect(() => {
    if (!isNewCandidateModalOpen) return undefined;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    setForm((current) => ({
      ...current,
      stage: newCandidateStagePrefill ?? current.stage,
    }));
    const timeout = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isNewCandidateModalOpen, newCandidateStagePrefill]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (!isNewCandidateModalOpen) return null;

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const closeModal = () => {
    setNewCandidateModalOpen(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      previousActiveRef.current?.focus();
    }, 280);
  };

  const validate = () => {
    const nextErrors: Partial<typeof form> = {};
    if (!form.name.trim()) nextErrors.name = "Required";
    if (!form.email.trim()) nextErrors.email = "Required";
    if (!form.role.trim()) nextErrors.role = "Required";
    if (!form.company.trim()) nextErrors.company = "Required";
    const experience = Number(form.experience);
    if (!form.experience || Number.isNaN(experience) || experience < 0 || experience > 40) {
      nextErrors.experience = "Enter a valid number (0-40)";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const experience = Number(form.experience);
    const initials = form.name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
    const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

    addCandidate({
      id: `c-${Date.now()}`,
      name: form.name.trim(),
      initials,
      avatarColor: gradient,
      email: form.email.trim(),
      currentRole: form.role.trim(),
      currentCompany: form.company.trim(),
      experience,
      experienceBracket: expBracket(experience),
      matchScore: Math.floor(Math.random() * 40) + 50,
      stage: form.stage,
      status: "Active",
      lastActivity: new Date().toISOString(),
      skills: [],
      education: "",
      location: "",
      summary: "",
      tags: [],
      timeline: [{
        id: `t-${Date.now()}`,
        stage: form.stage,
        date: new Date().toISOString(),
        actor: "Priya Sharma",
        note: "Manually added",
      }],
      notes: [],
    });

    setSubmitted(true);
    const timeout = window.setTimeout(() => {
      setSubmitted(false);
      setForm({
        name: "",
        email: "",
        role: "",
        company: "",
        experience: "",
        stage: "Applied",
      });
      closeModal();
    }, 1200);
    closeTimeoutRef.current = timeout;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-50 animate-fadeIn"
        onClick={closeModal}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Add new candidate"
          className={cn(
            "w-full max-w-md bg-[#111827] border border-white/[0.1]",
            "rounded-2xl shadow-2xl shadow-black/70",
            "pointer-events-auto animate-scaleIn",
            "flex flex-col max-h-[90vh]",
          )}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <UserPlus size={15} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-[14px] font-display font-semibold text-white">Add New Candidate</h3>
                <p className="text-[11px] text-slate-500">Fill in details to add to the pipeline</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-white/[0.07] focus-visible:bg-white/[0.07] text-slate-500 hover:text-white focus-visible:text-white transition-all duration-200 active:scale-[0.98]"
              aria-label="Close add candidate modal"
            >
              <X size={15} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            <Field label="Full Name *" error={errors.name}>
              <input
                ref={nameInputRef}
                className={cn(INPUT_CLS, errors.name && "border-rose-500/50")}
                placeholder="e.g. Arjun Mehta"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
              />
            </Field>

            <Field label="Email *" error={errors.email}>
              <input
                type="email"
                className={cn(INPUT_CLS, errors.email && "border-rose-500/50")}
                placeholder="e.g. arjun@gmail.com"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Current Role *" error={errors.role}>
                <input
                  className={cn(INPUT_CLS, errors.role && "border-rose-500/50")}
                  placeholder="e.g. Frontend Dev"
                  value={form.role}
                  onChange={(event) => setField("role", event.target.value)}
                />
              </Field>
              <Field label="Company *" error={errors.company}>
                <input
                  className={cn(INPUT_CLS, errors.company && "border-rose-500/50")}
                  placeholder="e.g. Razorpay"
                  value={form.company}
                  onChange={(event) => setField("company", event.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience (yrs) *" error={errors.experience}>
                <input
                  type="number"
                  min="0"
                  max="40"
                  className={cn(INPUT_CLS, errors.experience && "border-rose-500/50")}
                  placeholder="e.g. 4"
                  value={form.experience}
                  onChange={(event) => setField("experience", event.target.value)}
                />
              </Field>
              <Field label="Pipeline Stage">
                <select
                  value={form.stage}
                  onChange={(event) => setField("stage", event.target.value as Stage)}
                  className={cn(INPUT_CLS, "cursor-pointer appearance-none")}
                >
                  {["Applied", "Shortlisted", "Interview", "Offered", "Hired"].map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
            <button
              onClick={closeModal}
              className="text-[13px] font-medium text-slate-400 hover:text-white focus-visible:text-white px-4 py-2 rounded-lg hover:bg-white/[0.06] focus-visible:bg-white/[0.06] transition-all duration-200 border border-transparent hover:border-white/[0.08] focus-visible:border-white/[0.08] active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={cn(
                "flex items-center gap-2 text-[13px] font-semibold px-5 py-2 rounded-lg transition-all duration-200 active:scale-[0.98]",
                submitted
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 focus-visible:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
              )}
            >
              {submitted
                ? <><CheckCircle2 size={14} /> Added!</>
                : <><UserPlus size={14} /> Add Candidate</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
}
