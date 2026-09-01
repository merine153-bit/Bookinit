"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = React.createContext<(message: string, tone?: ToastTone) => void>(() => {});

export function useToast() {
  return React.useContext(ToastContext);
}

const ICONS: Record<ToastTone, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const push = React.useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            aria-atomic="true"
            className="fixed inset-x-0 bottom-24 md:bottom-8 z-[200] flex flex-col items-center gap-2 px-container-margin pointer-events-none"
          >
            {toasts.map((toast) => {
              const Icon = ICONS[toast.tone];
              return (
                <div
                  key={toast.id}
                  className={cn(
                    "pointer-events-auto flex items-center gap-3 rounded-full ps-4 pe-5 py-3 shadow-level-2 animate-[fade-up_220ms_cubic-bezier(0.16,1,0.3,1)]",
                    toast.tone === "error"
                      ? "bg-error-container text-on-error-container"
                      : "bg-inverse-surface text-inverse-on-surface",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className="font-body text-label-md">{toast.message}</span>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
