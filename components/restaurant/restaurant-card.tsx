import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { VenueTypeBadge } from "@/components/ui/venue-type-badge";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { SaveButton } from "@/components/social/save-button";
import { LiveDistance } from "./live-distance";
import type { Restaurant } from "@/types";

/** بطاقة مطعم قياسية — تُستخدم في البحث والمحفوظات والقوائم الجانبية. */
export function RestaurantCard({
  restaurant,
  showSave = true,
}: {
  restaurant: Restaurant;
  showSave?: boolean;
}) {
  return (
    <Card interactive className="group flex flex-col h-full">
      <div className="relative aspect-[16/10] w-full">
        <Link href={`/restaurant/${restaurant.slug}`} aria-label={restaurant.name}>
          <Image
            src={restaurant.coverUrl}
            alt={`صورة ${restaurant.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
          />
        </Link>
        {showSave && (
          <div className="absolute top-3 start-3">
            <SaveButton
              type="restaurant"
              id={restaurant.id}
              className="size-9 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center shadow-level-1"
            />
          </div>
        )}
        <span className="absolute bottom-3 end-3 rounded-full bg-surface/90 backdrop-blur-sm px-3 py-1 text-label-sm text-on-surface shadow-level-1">
          <LiveDistance
            latitude={restaurant.latitude}
            longitude={restaurant.longitude}
            fallbackKm={restaurant.distanceKm}
          />
        </span>
      </div>

      <div className="p-gutter flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/restaurant/${restaurant.slug}`} className="min-w-0">
            <h3 className="font-display text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
          </Link>
          <Rating value={restaurant.rating} size="sm" className="shrink-0" />
        </div>
        <p className="font-body text-label-sm text-on-surface-variant line-clamp-2">
          {restaurant.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
          <VenueTypeBadge category={restaurant.category} size="sm" />
          <Badge tone="neutral">{restaurant.category}</Badge>
          {restaurant.isVerified && <Badge tone="neutral">موثّق</Badge>}
        </div>
      </div>
    </Card>
  );
}
