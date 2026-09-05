"use client";

import Link from "next/link";
import { Navigation } from "lucide-react";
import { useUserLocation } from "@/hooks/use-location";
import { formatDistance } from "@/lib/utils";
import type { Restaurant } from "@/types";

/**
 * زر «الاتجاهات» في صفحة المكان.
 * يفتح الاستكشاف على وجهة محدّدة فيرسم الطريق من موقع الزبون،
 * ويعرض المسافة الحقيقية مباشرةً لمن سبق أن فعّل تحديد الموقع.
 */
export function DirectionsLink({
  restaurant,
}: {
  restaurant: Pick<Restaurant, "slug" | "name" | "latitude" | "longitude" | "distanceKm">;
}) {
  const { distanceTo } = useUserLocation();
  const live = distanceTo(restaurant);

  return (
    <Link
      href={`/discover?to=${restaurant.slug}`}
      aria-label={`عرض الطريق إلى ${restaurant.name} على الخريطة`}
      className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-secondary text-on-secondary font-body text-label-md shadow-level-1 hover:bg-secondary/90 transition-all active:scale-[0.98]"
    >
      <Navigation className="size-5 shrink-0" aria-hidden />
      الاتجاهات
      {live !== null && (
        <span className="numeric text-label-sm opacity-80">· {formatDistance(live)}</span>
      )}
    </Link>
  );
}
