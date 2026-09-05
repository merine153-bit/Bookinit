"use client";

import { Crosshair, Loader2, LocateFixed, LocateOff } from "lucide-react";
import { useUserLocation } from "@/hooks/use-location";
import { cn } from "@/lib/utils";

/**
 * زر "موقعي" فوق الخريطة.
 * الموقع يُقرأ من أقمار GPS عبر متصفح المستخدم ويبقى في جهازه.
 */
export function LocateButton({
  onRecenter,
  className,
}: {
  onRecenter: () => void;
  className?: string;
}) {
  const { status, start, stop } = useUserLocation();

  const locating = status === "locating";
  const tracking = status === "tracking";
  const blocked = status === "denied" || status === "unsupported";

  const label = locating
    ? "جارٍ تحديد موقعك…"
    : tracking
      ? "توسيط الخريطة على موقعك"
      : blocked
        ? "تحديد الموقع غير متاح"
        : "حدّد موقعي";

  const Icon = locating ? Loader2 : blocked ? LocateOff : tracking ? LocateFixed : Crosshair;

  return (
    <button
      type="button"
      onClick={() => {
        if (tracking) onRecenter();
        else start();
      }}
      onDoubleClick={() => tracking && stop()}
      aria-label={label}
      title={label}
      className={cn(
        "size-12 rounded-full flex items-center justify-center shadow-level-2 transition-all active:scale-90",
        tracking
          ? "bg-primary text-on-primary"
          : "bg-surface-container-lowest text-on-surface-variant hover:text-primary",
        blocked && "opacity-70",
        className,
      )}
    >
      <Icon className={cn("size-6", locating && "animate-spin")} aria-hidden />
    </button>
  );
}
