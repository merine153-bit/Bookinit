"use client";

import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** الخيار الأول يظهر بأيقونة تصفية وأسلوب "غابة" كما في التصميم. */
  firstIsFilter?: boolean;
  className?: string;
  ariaLabel: string;
}

/** أزرار تصفية على شكل حبوب — العنصر النشط بالأحمر الأساسي. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  firstIsFilter = false,
  className,
  ariaLabel,
}: FilterChipsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex items-center gap-2 overflow-x-auto hide-scrollbar", className)}
    >
      {options.map((option, index) => {
        const isFilterChip = firstIsFilter && index === 0;
        const active = option === value;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full text-label-md transition-all duration-200 active:scale-95 shadow-level-1",
              active
                ? "bg-primary text-on-primary shadow-level-2"
                : isFilterChip
                  ? "bg-secondary-container/70 text-on-secondary-container backdrop-blur-sm"
                  : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-high",
            )}
          >
            {isFilterChip && <SlidersHorizontal className="size-4" aria-hidden />}
            {option}
          </button>
        );
      })}
    </div>
  );
}
