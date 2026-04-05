"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ToastType = "success" | "warning" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  undoAction?: () => void;
  undoLabel?: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
} satisfies Record<ToastType, React.ElementType>;

const STYLES = {
  success: "border-emerald-500/20 text-emerald-300",
  warning: "border-amber-500/20 text-amber-300",
  error: "border-rose-500/20 text-rose-300",
  info: "border-sky-500/20 text-sky-300",
} satisfies Record<ToastType, string>;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [{ ...toast, id }, ...current].slice(0, 3));
    window.setTimeout(() => dismissToast(id), 4000);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "w-[320px] overflow-hidden rounded-xl border bg-[#111827] shadow-xl shadow-black/40",
              STYLES[toast.type],
              reducedMotion ? "" : "animate-scaleIn",
            )}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <Icon size={18} className="mt-0.5 flex-shrink-0" />
              <p className="flex-1 text-sm text-slate-100">{toast.message}</p>
              {toast.undoAction && (
                <button
                  onClick={() => {
                    toast.undoAction?.();
                    onDismiss(toast.id);
                  }}
                  className="text-xs font-medium text-indigo-300 underline underline-offset-2 transition-all duration-200 hover:text-indigo-200 focus-visible:text-indigo-200"
                >
                  {toast.undoLabel ?? "Undo"}
                </button>
              )}
            </div>
            <div className="h-0.5 w-full bg-white/[0.06]">
              <div className="h-full bg-current animate-[toastDrain_4s_linear_forwards]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
