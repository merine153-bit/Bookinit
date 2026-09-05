"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MapPinOff, Navigation, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RestaurantPreviewCard } from "@/components/restaurant/restaurant-preview-card";
import { RestaurantListItem } from "./restaurant-list-item";
import { CAFE_CATEGORIES } from "@/lib/venue";
import { useUserLocation } from "@/hooks/use-location";
import { formatDistance } from "@/lib/utils";
import { LocateButton } from "./locate-button";
import { LayerSwitcher } from "./layer-switcher";
import { DirectionsButton, RoutePanel } from "./route-panel";
import { fetchRoute, RoutingError, type RouteResult } from "@/lib/routing";
import type { MapLayer } from "@/lib/map-layers";
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

export function DiscoverClient({
  restaurants,
  initialRouteSlug,
}: {
  restaurants: Restaurant[];
  /** يفتح المسار مباشرة عند القدوم من صفحة مطعم عبر ‎/discover?to=slug‎. */
  initialRouteSlug?: string;
}) {
  const [quick, setQuick] = React.useState<QuickFilter>("المطاعم");
  const [filters, setFilters] = React.useState<DiscoverFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [recenterKey, setRecenterKey] = React.useState(0);
  const [layer, setLayer] = React.useState<MapLayer>("streets");
  const [routeTargetId, setRouteTargetId] = React.useState<string | null>(null);
  const [route, setRoute] = React.useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = React.useState(false);
  const [routeError, setRouteError] = React.useState<string | null>(null);

  const { position, error, distanceTo, start: startLocating } = useUserLocation();
  const routeTarget = restaurants.find((r) => r.id === routeTargetId) ?? null;

  /** المسافة الحقيقية عند توفّر الموقع، وإلا التقديرية المخزّنة. */
  const distanceOf = React.useCallback(
    (r: Restaurant) => distanceTo(r) ?? r.distanceKm,
    [distanceTo],
  );

  // القدوم من صفحة مطعم: حدّد الوجهة واطلب الموقع إن لزم.
  React.useEffect(() => {
    if (!initialRouteSlug) return;
    const target = restaurants.find((r) => r.slug === initialRouteSlug);
    if (!target) return;
    // تصفية "المطاعم" الافتراضية تُخفي المقاهي؛ الوجهة المطلوبة صراحةً تسبقها.
    setQuick(null);
    setSelectedId(target.id);
    setRouteTargetId(target.id);
    startLocating();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRouteSlug]);

  // حساب المسار كلما تغيّرت الوجهة أو تحرّك المستخدم.
  React.useEffect(() => {
    if (!routeTarget || !position) {
      setRoute(null);
      return;
    }
    const controller = new AbortController();
    setRouteLoading(true);
    setRouteError(null);

    fetchRoute(position, routeTarget, controller.signal)
      .then((result) => {
        setRoute(result);
        setRouteLoading(false);
      })
      .catch((cause: unknown) => {
        if ((cause as Error)?.name === "AbortError") return;
        setRoute(null);
        setRouteLoading(false);
        setRouteError(
          cause instanceof RoutingError ? cause.message : "تعذّر حساب الطريق.",
        );
      });

    return () => controller.abort();
    // إعادة الحساب مرتبطة بالإحداثيات نفسها، لا بمرجع كائن الموقع المتغيّر كل قراءة.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTarget, position?.latitude, position?.longitude]);

  const results = React.useMemo(() => {
    let list = restaurants;

    if (quick === "المطاعم") list = list.filter((r) => !CAFE_CATEGORIES.has(r.category));
    else if (quick === "المقاهي") list = list.filter((r) => CAFE_CATEGORIES.has(r.category));
    else if (quick === "الأعلى تقييماً") list = [...list].sort((a, b) => b.rating - a.rating);

    if (filters.categories.length > 0) {
      list = list.filter((r) => filters.categories.includes(r.category));
    }
    if (filters.minRating > 0) list = list.filter((r) => r.rating >= filters.minRating);
    if (filters.maxDistance < 20) list = list.filter((r) => distanceOf(r) <= filters.maxDistance);
    if (filters.priceRange > 0) list = list.filter((r) => r.priceRange === filters.priceRange);

    // عند معرفة الموقع، الأقرب أولاً — وهو الترتيب المتوقّع في خريطة استكشاف.
    if (position) list = [...list].sort((a, b) => distanceOf(a) - distanceOf(b));

    return list;
  }, [restaurants, quick, filters, position, distanceOf]);

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
            {position && (
              <>
                {" · "}
                <span className="text-secondary">مرتّبة حسب قربها منك</span>
              </>
            )}
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
        <MapView
          restaurants={results}
          selectedId={selectedId}
          onSelect={setSelectedId}
          userPosition={position}
          recenterKey={recenterKey}
          layer={layer}
          route={route}
        />

        {/* مبدّل الطبقة — مقابل زر الموقع على الجهة الأخرى */}
        <div className="absolute start-container-margin bottom-40 lg:bottom-gutter z-[400]">
          <LayerSwitcher value={layer} onChange={setLayer} />
        </div>

        {/* زر تحديد الموقع فوق الخريطة */}
        <div className="absolute end-gutter bottom-40 lg:bottom-gutter z-[400]">
          <LocateButton onRecenter={() => setRecenterKey((k) => k + 1)} />
        </div>

        {/* لوحة المسار */}
        {routeTarget && (
          <div className="absolute inset-x-0 top-20 z-[410] px-container-margin pointer-events-none">
            <div className="mx-auto max-w-md pointer-events-auto">
              <RoutePanel
                restaurant={routeTarget}
                route={route}
                loading={routeLoading}
                error={
                  routeError ??
                  error ??
                  (!position ? "بانتظار تحديد موقعك… الطريق يُرسم من مكانك الحالي." : null)
                }
                from={position}
                onClose={() => {
                  setRouteTargetId(null);
                  setRoute(null);
                  setRouteError(null);
                }}
              />
            </div>
          </div>
        )}

        {/* شريط حالة الموقع */}
        {!routeTarget && (error || position) && (
          <div className="absolute inset-x-0 top-20 z-[400] px-container-margin pointer-events-none">
            <div className="mx-auto max-w-md pointer-events-auto">
              {error ? (
                <p
                  role="alert"
                  className="rounded-lg bg-error-container px-4 py-3 font-body text-label-sm text-on-error-container shadow-level-1"
                >
                  {error}
                </p>
              ) : (
                position && (
                  <p className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 font-body text-label-sm text-on-surface shadow-level-1">
                    <Navigation className="size-4 text-secondary" aria-hidden />
                    موقعك محدَّد بدقة{" "}
                    <span className="numeric">{formatDistance(position.accuracy / 1000)}</span>
                  </p>
                )
              )}
            </div>
          </div>
        )}

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
              <RestaurantPreviewCard
                restaurant={selected}
                directions={
                  <DirectionsButton
                    onClick={() => {
                      setRouteTargetId(selected.id);
                      if (!position) startLocating();
                    }}
                    hint={position ? undefined : "سيُطلب إذن الموقع لحساب الطريق"}
                  />
                }
              />
            </div>
          </div>
        )}
        {selected && (
          <div className="hidden lg:block absolute top-24 end-gutter z-[400] w-[380px]">
            <RestaurantPreviewCard
              restaurant={selected}
              directions={
                <DirectionsButton
                  onClick={() => {
                    setRouteTargetId(selected.id);
                    if (!position) startLocating();
                  }}
                  hint={position ? undefined : "سيُطلب إذن الموقع لحساب الطريق"}
                />
              }
            />
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
