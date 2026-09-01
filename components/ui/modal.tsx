"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** "drawer" ينزلق من الأسفل على الجوال ويظهر كنافذة على الشاشات الكبيرة. */
  variant?: "modal" | "drawer";
  className?: string;
}

/** نافذة/درج قابل للوصول: إغلاق بـ Escape، حصر التركيز، وقفل تمرير الصفحة. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  variant = "modal",
  className,
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panelRef.current;
      target?.focus();
    }, 30);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      window.clearTimeout(timer);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px] animate-[fade-up_180ms_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full bg-surface-container-lowest shadow-level-2 outline-none",
          "max-h-[90dvh] overflow-y-auto",
          variant === "drawer"
            ? "rounded-t-xl sm:rounded-xl sm:max-w-lg animate-[fade-up_240ms_cubic-bezier(0.16,1,0.3,1)]"
            : "rounded-t-xl sm:rounded-xl sm:max-w-lg animate-[scale-in_200ms_ease-out]",
          className,
        )}
      >
        <div className="sticky top-0 glass flex items-start justify-between gap-4 px-container-margin pt-stack-lg pb-stack-md border-b border-outline-variant/20">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">{title}</h2>
            {description && (
              <p className="font-body text-label-md text-on-surface-variant mt-1">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="shrink-0 size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="px-container-margin py-stack-lg">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
