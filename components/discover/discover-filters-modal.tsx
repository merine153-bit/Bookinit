"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { RESTAURANT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface DiscoverFilters {
  categories: string[];
  minRating: number;
  maxDistance: number;
  priceRange: number;
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  categories: [],
  minRating: 0,
  maxDistance: 20,
  priceRange: 0,
};

const PRICE_LABELS = ["الكل", "$ اقتصادي", "$$ متوسط", "$$$ فاخر"];

/** نافذة التصفية المتقدمة للخريطة. */
export function DiscoverFiltersModal({
  open,
  onClose,
  filters,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
}) {
  const toggleCategory = (category: string) =>
    onChange({
      ...filters,
      categories: filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category],
    });

  return (
    <Modal open={open} onClose={onClose} title="تصفية النتائج" variant="drawer">
      <div className="flex flex-col gap-stack-lg">
        <div className="flex flex-col gap-2">
          <span className="font-body text-label-md text-on-surface">الفئات</span>
          <div className="flex flex-wrap gap-2">
            {RESTAURANT_CATEGORIES.map((category) => {
              const active = filters.categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-label-sm transition-all active:scale-95",
                    active
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="أقل تقييم" htmlFor="filter-rating">
          <Select
            id="filter-rating"
            value={filters.minRating}
            onChange={(event) => onChange({ ...filters, minRating: Number(event.target.value) })}
          >
            <option value={0}>الكل</option>
            <option value={4}>4.0 فأعلى</option>
            <option value={4.5}>4.5 فأعلى</option>
            <option value={4.8}>4.8 فأعلى</option>
          </Select>
        </Field>

        <Field label="أقصى مسافة" htmlFor="filter-distance">
          <Select
            id="filter-distance"
            value={filters.maxDistance}
            onChange={(event) => onChange({ ...filters, maxDistance: Number(event.target.value) })}
          >
            <option value={20}>الكل</option>
            <option value={2}>حتى 2 كم</option>
            <option value={5}>حتى 5 كم</option>
            <option value={10}>حتى 10 كم</option>
          </Select>
        </Field>

        <Field label="نطاق السعر" htmlFor="filter-price">
          <Select
            id="filter-price"
            value={filters.priceRange}
            onChange={(event) => onChange({ ...filters, priceRange: Number(event.target.value) })}
          >
            {PRICE_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="full" onClick={() => onChange(DEFAULT_FILTERS)}>
            إعادة تعيين
          </Button>
          <Button size="full" onClick={onClose}>
            عرض النتائج
          </Button>
        </div>
      </div>
    </Modal>
  );
}
