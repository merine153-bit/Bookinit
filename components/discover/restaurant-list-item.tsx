"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { cn, formatDistance, formatRating } from "@/lib/utils";
import type { Restaurant } from "@/types";

/**
 * صف مضغوط في لوحة نتائج الخريطة.
 * عنصر تفاعلي واحد (زر) لتحديد المكان على الخريطة — بلا عناصر تفاعلية متداخلة.
 */
export function RestaurantListItem({
  restaurant,
  active,
  onSelect,
}: {
  restaurant: Restaurant;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "w-full text-start flex gap-3 p-3 rounded-xl bg-surface-container-lowest shadow-level-1 transition-all hover:shadow-level-2",
        active && "ring-2 ring-primary",
      )}
    >
      <span className="relative size-20 rounded-lg overflow-hidden shrink-0">
        <Image
          src={restaurant.coverUrl}
          alt=""
          fill
          sizes="80px"
          className="object-cover"
        />
      </span>
      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-display text-label-md text-on-surface truncate">
            {restaurant.name}
          </span>
          <span className="shrink-0 inline-flex items-center gap-1">
            <Star className="size-3.5 fill-honey text-honey" aria-hidden />
            <span className="numeric font-body text-label-sm text-on-surface">
              {formatRating(restaurant.rating)}
            </span>
          </span>
        </span>
        <span className="font-body text-label-sm text-on-surface-variant line-clamp-2">
          {restaurant.shortDescription}
        </span>
        <span className="inline-flex items-center gap-1 font-body text-label-sm text-on-surface-variant/80">
          <MapPin className="size-3.5" aria-hidden />
          <span className="numeric">{formatDistance(restaurant.distanceKm)}</span>
        </span>
      </span>
    </button>
  );
}
