import Image from "next/image";
import { BadgeCheck, Clock, MapPin, Phone } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { SaveButton } from "@/components/social/save-button";
import { cn, openingStatus } from "@/lib/utils";
import type { Restaurant } from "@/types";
import { FollowButton } from "./follow-button";

/** غلاف المطعم مع الشعار الدائري المتداخل وبطاقة المعلومات الأساسية. */
export function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
  const status = openingStatus(restaurant.hours);

  return (
    <section className="relative w-full">
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={restaurant.coverUrl}
          alt={`غلاف ${restaurant.name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" aria-hidden />
      </div>

      <div className="px-container-margin -mt-16 md:-mt-24 relative flex flex-col md:flex-row items-center md:items-end gap-6 pb-stack-lg max-w-7xl mx-auto">
        <div className="size-32 md:size-48 rounded-full border-4 border-surface shadow-level-2 overflow-hidden shrink-0 bg-surface-container-lowest">
          <Image
            src={restaurant.logoUrl}
            alt={`شعار ${restaurant.name}`}
            width={192}
            height={192}
            className="size-full object-cover"
          />
        </div>

        <div className="text-center md:text-start flex-1 pt-4 md:pt-0 pb-2 min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
              {restaurant.name}
            </h1>
            {restaurant.isVerified && (
              <BadgeCheck
                className="size-6 text-primary-container fill-primary-container/20"
                aria-label="حساب موثّق"
              />
            )}
          </div>

          <p className="font-body text-body-md text-on-surface-variant max-w-2xl mx-auto md:mx-0">
            {restaurant.description}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-stack-md font-body text-label-sm">
            <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} />
            <span className="text-tertiary-container" aria-hidden>•</span>
            <span className="flex items-center gap-1 text-on-surface-variant">
              <MapPin className="size-4" aria-hidden />
              {restaurant.city}، {restaurant.address.split("،").pop()?.trim()}
            </span>
            <span className="text-tertiary-container" aria-hidden>•</span>
            <span className="flex items-center gap-1 text-on-surface-variant">
              <Clock className="size-4" aria-hidden />
              <span className={cn("font-semibold", status.isOpen ? "text-secondary" : "text-error")}>
                {status.label}
              </span>
              <span aria-hidden>•</span>
              {status.detail}
            </span>
            {restaurant.phone && (
              <>
                <span className="text-tertiary-container" aria-hidden>•</span>
                <a
                  href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Phone className="size-4" aria-hidden />
                  <span dir="ltr">{restaurant.phone}</span>
                </a>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 pb-2">
          <FollowButton restaurantId={restaurant.id} restaurantName={restaurant.name} />
          <SaveButton
            type="restaurant"
            id={restaurant.id}
            className="size-12 rounded-full bg-surface-container flex items-center justify-center"
          />
        </div>
      </div>
    </section>
  );
}
