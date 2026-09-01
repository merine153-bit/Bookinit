"use client";

import * as React from "react";
import Link from "next/link";
import { BookmarkX } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { EmptyState } from "@/components/ui/empty-state";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { Card } from "@/components/ui/card";
import { RestaurantCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MenuItem, Post, Restaurant } from "@/types";
import Image from "next/image";

const TABS = ["المطاعم", "الأطباق", "المنشورات"] as const;
type Tab = (typeof TABS)[number];

/** صفحة المحفوظات — تعرض ما حفظه المستخدم على هذا الجهاز. */
export function SavedClient({
  restaurants,
  items,
  posts,
}: {
  restaurants: Restaurant[];
  items: MenuItem[];
  posts: Post[];
}) {
  const { savedIds, ready, savedCount } = useAppState();
  const [tab, setTab] = React.useState<Tab>("المطاعم");

  const restaurantById = React.useMemo(
    () => new Map(restaurants.map((r) => [r.id, r])),
    [restaurants],
  );

  const savedRestaurants = restaurants.filter((r) => savedIds("restaurant").includes(r.id));
  const savedItems = items.filter((i) => savedIds("menu_item").includes(i.id));
  const savedPosts = posts.filter((p) => savedIds("post").includes(p.id));

  const counts: Record<Tab, number> = {
    المطاعم: savedRestaurants.length,
    الأطباق: savedItems.length,
    المنشورات: savedPosts.length,
  };

  if (!ready) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {Array.from({ length: 3 }, (_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (savedCount === 0) {
    return (
      <EmptyState
        icon={BookmarkX}
        title="لا توجد عناصر محفوظة بعد"
        description="احفظ المطاعم والأطباق والمنشورات التي تعجبك لتجدها هنا في أي وقت."
        actionLabel="اكتشف أماكن جديدة"
        actionHref="/discover"
      />
    );
  }

  return (
    <div className="flex flex-col gap-stack-lg">
      <div role="tablist" aria-label="أقسام المحفوظات" className="flex gap-2 overflow-x-auto hide-scrollbar">
        {TABS.map((option) => (
          <button
            key={option}
            role="tab"
            aria-selected={tab === option}
            onClick={() => setTab(option)}
            className={cn(
              "shrink-0 px-5 py-3 rounded-full text-label-md transition-all active:scale-95",
              tab === option
                ? "bg-primary text-on-primary shadow-level-1"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            {option} (<span className="numeric">{counts[option]}</span>)
          </button>
        ))}
      </div>

      {counts[tab] === 0 ? (
        <EmptyState
          icon={BookmarkX}
          title={`لا توجد ${tab} محفوظة`}
          description="تصفّح التطبيق واحفظ ما يعجبك ليظهر هنا."
          actionLabel="اكتشف أماكن جديدة"
          actionHref="/discover"
        />
      ) : tab === "المطاعم" ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {savedRestaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <RestaurantCard restaurant={restaurant} />
            </li>
          ))}
        </ul>
      ) : tab === "الأطباق" ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
          {savedItems.map((item) => (
            <li key={item.id}>
              <MenuItemCard
                item={item}
                restaurantName={restaurantById.get(item.restaurantId)?.name}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
          {savedPosts.map((post) => {
            const restaurant = restaurantById.get(post.restaurantId);
            return (
              <li key={post.id}>
                <Card interactive>
                  <Link href={restaurant ? `/restaurant/${restaurant.slug}` : "/"}>
                    <div className="relative aspect-square w-full">
                      <Image
                        src={post.imageUrl}
                        alt={post.caption}
                        fill
                        sizes="(max-width: 768px) 50vw, 300px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-gutter">
                      <p className="font-body text-label-md text-on-surface truncate">
                        {restaurant?.name}
                      </p>
                      <p className="font-body text-label-sm text-on-surface-variant line-clamp-2">
                        {post.caption}
                      </p>
                    </div>
                  </Link>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
