import Image from "next/image";
import Link from "next/link";
import { BookOpen, MapPin, Star } from "lucide-react";
import { SaveButton } from "@/components/social/save-button";
import { formatDistance, formatRating } from "@/lib/utils";
import type { Restaurant } from "@/types";

/** بطاقة المعاينة التي تظهر فوق الخريطة عند اختيار علامة مطعم. */
export function RestaurantPreviewCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <article className="bg-surface-container-low rounded-xl shadow-level-2 overflow-hidden animate-[fade-up_260ms_cubic-bezier(0.16,1,0.3,1)]">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={restaurant.coverUrl}
          alt={`صورة ${restaurant.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover"
        />
        <div className="absolute top-4 start-4">
          <SaveButton
            type="restaurant"
            id={restaurant.id}
            className="size-10 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center shadow-level-1"
          />
        </div>
        <span className="absolute bottom-4 end-4 inline-flex items-center gap-1.5 rounded-lg bg-surface/90 backdrop-blur-sm px-3 py-1.5 text-label-md text-on-surface shadow-level-1">
          <MapPin className="size-4" aria-hidden />
          <span className="numeric">{formatDistance(restaurant.distanceKm)}</span>
        </span>
      </div>

      <div className="p-container-margin flex flex-col gap-stack-md">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-headline-md text-on-surface min-w-0">
            <Link href={`/restaurant/${restaurant.slug}`} className="hover:text-primary transition-colors">
              {restaurant.name}
            </Link>
          </h2>
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 py-1.5 shadow-level-1">
            <Star className="size-4 fill-honey text-honey" aria-hidden />
            <span className="numeric font-display text-label-md font-bold text-on-surface">
              {formatRating(restaurant.rating)}
            </span>
          </span>
        </div>

        <p className="font-body text-body-md text-on-surface-variant">{restaurant.shortDescription}</p>

        <hr className="border-t border-outline-variant/30" />

        <Link
          href={`/restaurant/${restaurant.slug}/menu`}
          className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-lg bg-primary text-on-primary font-body text-label-md shadow-level-1 hover:bg-primary/90 transition-colors active:scale-[0.99]"
        >
          <BookOpen className="size-5" aria-hidden />
          عرض المنيو
        </Link>
      </div>
    </article>
  );
}
