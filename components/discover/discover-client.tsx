"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MapPinOff, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RestaurantPreviewCard } from "@/components/restaurant/restaurant-preview-card";
import { RestaurantListItem } from "./restaurant-list-item";
import { CAFE_CATEGORIES } from "@/lib/venue";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/types";
import { DEFAULT_FILTERS, DiscoverFiltersModal, type DiscoverFilters } from "./discover-filters-modal";

/** الخريطة تعمل في المتصفح فقط (Leaflet يحتاج إلى window). */
const MapView = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

const QUICK_FILTERS = ["المطاعم", "المقاهي", "الأعلى تقييماً"] as const;
type QuickFilter = (typeof QUICK_FILTERS)[number] | null;

export function DiscoverClient({ restaurants }: { restaurants: Restaurant[] }) {
  const [quick, setQuick] = React.useState<QuickFilter>("المطاعم");
  const [filters, setFilters] = React.useState<DiscoverFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const results = React.useMemo(() => {
    let list = restaurants;

    if (quick === "المطاعم") list = list.filter((r) => !CAFE_CATEGORIES.has(r.category));
    else if (quick === "المقاهي") list = list.filter((r) => CAFE_CATEGORIES.has(r.category));
    else if (quick === "الأعلى تقييماً") list = [...list].sort((a, b) => b.rating - a.rating);

    if (filters.categories.length > 0) {
      list = list.filter((r) => filters.categories.includes(r.category));
    }
    if (filters.minRating > 0) list = list.filter((r) => r.rating >= filters.minRating);
    if (filters.maxDistance < 20) list = list.filter((r) => r.distanceKm <= filters.maxDistance);
    if (filters.priceRange > 0) list = list.filter((r) => r.priceRange === filters.priceRange);

    return list;
  }, [restaurants, quick, filters]);

  React.useEffect(() => {
    if (selectedId && !results.some((r) => r.id === selectedId)) setSelectedId(null);
  }, [results, selectedId]);

  const selected = results.find((r) => r.id === selectedId) ?? null;
  const activeFilterCount =
    filters.categories.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDistance < 20 ? 1 : 0) +
    (filters.priceRange > 0 ? 1 : 0);

  return (
    <div className="relative flex h-[calc(100dvh-72px)] w-full overflow-hidden">
      {/* لوحة القائمة الجانبية — سطح المكتب فقط */}
      <aside className="hidden lg:flex w-[380px] shrink-0 flex-col border-s border-outline-variant/30 bg-surface">
        <div className="px-container-margin py-stack-lg border-b border-outline-variant/20">
          <h2 className="font-display text-headline-md text-on-surface">استكشف حولك</h2>
          <p className="font-body text-label-md text-on-surface-variant mt-1">
            <span className="numeric">{results.length}</span> مكان في نطاق بحثك
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-container-margin py-gutter flex flex-col gap-gutter">
          {results.length === 0 ? (
            <EmptyState
              icon={MapPinOff}
              title="لا توجد أماكن مطابقة"
              description="جرّب توسيع نطاق البحث أو إزالة بعض عوامل التصفية."
            />
          ) : (
            results.map((restaurant) => (
              <RestaurantListItem
                key={restaurant.id}
                restaurant={restaurant}
                active={selectedId === restaurant.id}
                onSelect={() => setSelectedId(restaurant.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* الخريطة */}
      <div className="relative flex-1">
        <MapView restaurants={results} selectedId={selectedId} onSelect={setSelectedId} />

        {/* شريط التصفية العائم */}
        <div className="absolute top-gutter inset-x-0 z-[400] px-container-margin">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar max-w-3xl">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="فتح خيارات التصفية"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full text-label-md bg-secondary-container/80 text-on-secondary-container backdrop-blur-sm shadow-level-1 transition-all active:scale-95 hover:bg-secondary-container"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              تصفية
              {activeFilterCount > 0 && (
                <span className="numeric size-5 rounded-full bg-secondary text-on-secondary text-[11px] leading-5 text-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {QUICK_FILTERS.map((option) => {
              const active = quick === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setQuick(active ? null : option)}
                  className={cn(
                    "shrink-0 px-5 py-3 rounded-full text-label-md shadow-level-1 transition-all active:scale-95",
                    active
                      ? "bg-primary text-on-primary shadow-level-2"
                      : "bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface hover:bg-surface-container-lowest",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* بطاقة المعاينة فوق شريط التنقل السفلي */}
        {selected && (
          <div className="absolute inset-x-0 bottom-0 z-[400] px-container-margin pb-4 lg:hidden pointer-events-none">
            <div className="pointer-events-auto max-w-lg mx-auto">
              <RestaurantPreviewCard restaurant={selected} />
            </div>
          </div>
        )}
        {selected && (
          <div className="hidden lg:block absolute top-24 end-gutter z-[400] w-[380px]">
            <RestaurantPreviewCard restaurant={selected} />
          </div>
        )}

        {!selected && results.length > 0 && (
          <p className="absolute bottom-28 lg:bottom-6 inset-x-0 z-[400] text-center font-body text-label-sm text-on-surface-variant pointer-events-none">
            <span className="glass rounded-full px-4 py-2 shadow-level-1">
              اختر علامة على الخريطة لعرض تفاصيل المكان
            </span>
          </p>
        )}
      </div>

      <DiscoverFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
}
