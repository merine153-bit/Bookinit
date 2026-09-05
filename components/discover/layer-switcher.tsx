"use client";

import { Map as MapIcon, Satellite } from "lucide-react";
import type { MapLayer } from "@/lib/map-layers";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: MapLayer; label: string; icon: typeof MapIcon }> = [
  { value: "streets", label: "خريطة", icon: MapIcon },
  { value: "satellite", label: "قمر صناعي", icon: Satellite },
];

/**
 * مبدّل طبقة الخريطة بهوية Eatit.
 * مبدّل Leaflet الافتراضي كان يختفي خلف شريط التصفية العائم ويبدو غريباً
 * عن بقية الواجهة، فاستُبدل بعنصر يتبع نظام التصميم.
 */
export function LayerSwitcher({
  value,
  onChange,
  className,
}: {
  value: MapLayer;
  onChange: (layer: MapLayer) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="طبقة الخريطة"
      className={cn(
        "inline-flex items-center gap-1 rounded-full glass p-1 shadow-level-2",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-body text-label-sm transition-all active:scale-95",
              active
                ? "bg-primary text-on-primary shadow-level-1"
                : "text-on-surface-variant hover:bg-surface-container-high/70",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
