"use client";

import { Bookmark } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { SavedEntityType } from "@/types";

const LABELS: Record<SavedEntityType, string> = {
  restaurant: "المطعم",
  menu_item: "الطبق",
  post: "المنشور",
};

/** زر الحفظ — انتقال ناعم للأيقونة مع رسالة تأكيد قصيرة. */
export function SaveButton({
  type,
  id,
  className,
  withLabel = false,
}: {
  type: SavedEntityType;
  id: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { isSaved, toggleSave, ready } = useAppState();
  const toast = useToast();
  const saved = ready && isSaved(type, id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `إزالة ${LABELS[type]} من المحفوظات` : `حفظ ${LABELS[type]}`}
      onClick={() => {
        const next = toggleSave(type, id);
        toast(next ? `تم حفظ ${LABELS[type]} في المحفوظات` : `تمت إزالة ${LABELS[type]} من المحفوظات`);
      }}
      className={cn(
        "inline-flex items-center gap-2 transition-all duration-200 active:scale-90",
        saved ? "text-primary" : "text-on-surface-variant hover:text-primary",
        className,
      )}
    >
      <Bookmark
        className={cn("size-6 transition-transform duration-200", saved && "scale-110")}
        fill={saved ? "currentColor" : "none"}
        aria-hidden
      />
      {withLabel && (
        <span className="font-body text-label-md">{saved ? "محفوظ" : "حفظ"}</span>
      )}
    </button>
  );
}
