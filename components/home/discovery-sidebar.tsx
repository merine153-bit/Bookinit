import Image from "next/image";
import Link from "next/link";
import { Compass, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { RESTAURANT_CATEGORIES } from "@/lib/constants";
import type { Restaurant } from "@/types";

/** عمود جانبي للاكتشاف على الشاشات الكبيرة. */
export function DiscoverySidebar({ restaurants }: { restaurants: Restaurant[] }) {
  const top = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <aside className="hidden lg:flex flex-col gap-stack-lg sticky top-[96px] self-start">
      <Card className="p-gutter">
        <h2 className="flex items-center gap-2 font-display text-label-md text-on-surface mb-stack-md">
          <TrendingUp className="size-5 text-primary" aria-hidden />
          الأعلى تقييماً هذا الأسبوع
        </h2>
        <ul className="flex flex-col gap-stack-md">
          {top.map((restaurant) => (
            <li key={restaurant.id}>
              <Link
                href={`/restaurant/${restaurant.slug}`}
                className="flex items-center gap-3 group rounded-lg -m-1 p-1 hover:bg-surface-container-low transition-colors"
              >
                <Image
                  src={restaurant.logoUrl}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </span>
                  <span className="block font-body text-label-sm text-on-surface-variant truncate">
                    {restaurant.category}
                  </span>
                </span>
                <Rating value={restaurant.rating} size="sm" className="shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-gutter">
        <h2 className="flex items-center gap-2 font-display text-label-md text-on-surface mb-stack-md">
          <Compass className="size-5 text-secondary" aria-hidden />
          تصفح حسب الفئة
        </h2>
        <ul className="flex flex-wrap gap-2">
          {RESTAURANT_CATEGORIES.map((category) => (
            <li key={category}>
              <Link
                href={`/search?q=${encodeURIComponent(category)}`}
                className="inline-flex px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-label-sm hover:bg-surface-container-high transition-colors"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
