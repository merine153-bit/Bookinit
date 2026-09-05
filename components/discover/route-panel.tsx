"use client";

import { ExternalLink, Loader2, Navigation, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { externalDirectionsUrl, formatDuration, type RouteResult } from "@/lib/routing";
import { formatDistance } from "@/lib/utils";
import type { Coordinates } from "@/hooks/use-location";
import type { Restaurant } from "@/types";

/** ملخّص المسار أعلى الخريطة مع رابط الملاحة الخارجية. */
export function RoutePanel({
  restaurant,
  route,
  loading,
  error,
  from,
  onClose,
}: {
  restaurant: Restaurant;
  route: RouteResult | null;
  loading: boolean;
  error: string | null;
  from: Coordinates | null;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl glass shadow-level-2 p-gutter flex flex-col gap-stack-md animate-[fade-up_220ms_cubic-bezier(0.16,1,0.3,1)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-label-md text-on-surface">
            <Navigation className="size-4 text-primary shrink-0" aria-hidden />
            الطريق إلى {restaurant.name}
          </p>

          {loading && (
            <p className="flex items-center gap-2 font-body text-label-sm text-on-surface-variant mt-1">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              جارٍ حساب الطريق…
            </p>
          )}

          {route && !loading && (
            <p className="font-body text-body-md text-on-surface mt-1">
              <span className="numeric font-semibold">{formatDistance(route.distanceKm)}</span>
              {" · "}
              <span className="numeric">{formatDuration(route.durationMin)}</span>
              <span className="text-on-surface-variant"> بالسيارة تقريباً</span>
            </p>
          )}

          {error && (
            <p role="alert" className="font-body text-label-sm text-error mt-1">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="إخفاء الطريق"
          className="shrink-0 size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <a
        href={externalDirectionsUrl(restaurant, from)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary text-on-primary font-body text-label-md hover:bg-primary/90 transition-colors active:scale-[0.99]"
      >
        <ExternalLink className="size-5" aria-hidden />
        الملاحة في تطبيق الخرائط
      </a>
    </div>
  );
}

/** زر بدء التوجيه — يظهر داخل بطاقة معاينة المطعم. */
export function DirectionsButton({
  onClick,
  disabled,
  hint,
}: {
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <Button
      variant="secondary"
      size="full"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      className="mt-2"
    >
      <Navigation className="size-5" aria-hidden />
      الاتجاهات
    </Button>
  );
}
