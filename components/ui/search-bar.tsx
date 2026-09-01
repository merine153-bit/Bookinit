"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** حقل البحث الكبير — مستدير بالكامل مع أيقونة بحث وزر مسح. */
export function SearchBar({
  value,
  onChange,
  placeholder = "ابحث عن مطعم، مقهى أو طبق...",
  className,
  autoFocus = false,
  id = "search-input",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  id?: string;
}) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="absolute start-5 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant pointer-events-none"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        role="searchbox"
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="البحث في Eatit"
        className="w-full rounded-full bg-surface-container-lowest shadow-level-1 border border-outline-variant/30 ps-14 pe-12 py-4 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/80 outline-none transition-all focus:border-primary focus:shadow-level-2 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="مسح البحث"
          className="absolute end-4 top-1/2 -translate-y-1/2 size-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
