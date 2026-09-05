"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchX, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterChips } from "@/components/ui/filter-chips";
import { EmptyState } from "@/components/ui/empty-state";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { SEARCH_FILTERS } from "@/lib/constants";
import { buildSearchResults } from "@/lib/search";
import type { MenuItem, Restaurant, SearchFilter } from "@/types";
import { useUserLocation } from "@/hooks/use-location";

const SUGGESTIONS = ["قهوة مختصة", "سوشي", "بيتزا", "حلويات", "مأكولات بحرية", "نباتي"];

/** بحث حي في المطاعم والأطباق مع تصفية فورية. */
export function SearchClient({
  restaurants,
  items,
  initialQuery,
}: {
  restaurants: Restaurant[];
  items: MenuItem[];
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialQuery);
  const [filter, setFilter] = React.useState<SearchFilter>("الكل");
  const { distanceTo, position } = useUserLocation();

  // إبقاء العنوان متزامناً مع البحث حتى تبقى النتيجة قابلة للمشاركة.
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      router.replace(`/search${params.toString() ? `?${params}` : ""}`, { scroll: false });
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = React.useMemo(
    () =>
      buildSearchResults(query, filter, restaurants, items, (r) => distanceTo(r) ?? r.distanceKm),
    // موقع المستخدم يدخل في ترتيب "الأقرب إليك"، فيُعاد الحساب عند تغيّره.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, filter, restaurants, items, position?.latitude, position?.longitude],
  );

  const restaurantResults = results.filter((r) => r.kind === "restaurant");
  const dishResults = results.filter((r) => r.kind === "dish");
  const showSuggestions = !query.trim();

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div>
        <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface mb-stack-md">
          البحث
        </h1>
        <SearchBar value={query} onChange={setQuery} autoFocus />
      </div>

      <FilterChips
        options={SEARCH_FILTERS}
        value={filter}
        onChange={setFilter}
        ariaLabel="تصفية نتائج البحث"
      />

      {showSuggestions ? (
        <section aria-label="اقتراحات البحث" className="flex flex-col gap-stack-md">
          <h2 className="flex items-center gap-2 font-display text-headline-md text-on-surface">
            <Sparkles className="size-5 text-primary" aria-hidden />
            جرّب البحث عن
          </h2>
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="px-5 py-3 rounded-full bg-surface-container text-on-surface-variant text-label-md hover:bg-surface-container-high transition-colors active:scale-95"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>

          <h2 className="font-display text-headline-md text-on-surface mt-stack-md">
            أماكن مقترحة لك
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {restaurants.slice(0, 6).map((restaurant) => (
              <li key={restaurant.id}>
                <RestaurantCard restaurant={restaurant} />
              </li>
            ))}
          </ul>
        </section>
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="لم نجد نتائج مطابقة لبحثك"
          description="جرّب كلمات بحث مختلفة، أو تصفّح الأماكن القريبة منك على الخريطة."
          actionLabel="استكشف على الخريطة"
          actionHref="/discover"
        />
      ) : (
        <div className="flex flex-col gap-stack-lg">
          <p className="font-body text-label-md text-on-surface-variant">
            <span className="numeric">{results.length}</span> نتيجة لـ «{query}»
          </p>

          {restaurantResults.length > 0 && (
            <section aria-label="نتائج الأماكن">
              <h2 className="font-display text-headline-md text-on-surface mb-stack-md">الأماكن</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {restaurantResults.map((result) =>
                  result.kind === "restaurant" ? (
                    <li key={result.restaurant.id}>
                      <RestaurantCard restaurant={result.restaurant} />
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          )}

          {dishResults.length > 0 && (
            <section aria-label="نتائج الأطباق">
              <h2 className="font-display text-headline-md text-on-surface mb-stack-md">الأطباق</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
                {dishResults.map((result) =>
                  result.kind === "dish" ? (
                    <li key={result.item.id} className="flex flex-col gap-1">
                      <MenuItemCard item={result.item} restaurantName={result.restaurant.name} />
                      <Link
                        href={`/restaurant/${result.restaurant.slug}/menu`}
                        className="font-body text-label-sm text-on-surface-variant hover:text-primary transition-colors px-1"
                      >
                        من {result.restaurant.name} ←
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
