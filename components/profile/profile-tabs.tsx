"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StarRow } from "@/components/ui/rating";
import { EmptyState } from "@/components/ui/empty-state";
import { SavedClient } from "./saved-client";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import type { MenuItem, Post, Restaurant, Review } from "@/types";

const TABS = ["منشوراتي", "المحفوظات", "التقييمات"] as const;
type Tab = (typeof TABS)[number];

export function ProfileTabs({
  posts,
  reviews,
  restaurants,
  items,
  allPosts,
}: {
  posts: Post[];
  reviews: Review[];
  restaurants: Restaurant[];
  items: MenuItem[];
  allPosts: Post[];
}) {
  const [tab, setTab] = React.useState<Tab>("منشوراتي");
  const restaurantById = React.useMemo(
    () => new Map(restaurants.map((r) => [r.id, r])),
    [restaurants],
  );

  return (
    <div className="flex flex-col gap-stack-lg">
      <div
        role="tablist"
        aria-label="أقسام الملف الشخصي"
        className="flex items-center gap-8 border-b border-outline-variant/30 overflow-x-auto hide-scrollbar"
      >
        {TABS.map((option) => (
          <button
            key={option}
            role="tab"
            aria-selected={tab === option}
            onClick={() => setTab(option)}
            className={cn(
              "shrink-0 font-body text-label-md pb-3 px-2 border-b-2 transition-colors",
              tab === option
                ? "text-primary border-primary"
                : "text-on-surface-variant border-transparent hover:text-on-surface",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {tab === "منشوراتي" &&
        (posts.length === 0 ? (
          <EmptyState
            icon={ImageOff}
            title="لم تنشر شيئاً بعد"
            description="شارك صور أطباقك المفضلة ليراها متابعوك."
            actionLabel="اكتشف أماكن جديدة"
            actionHref="/discover"
          />
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
            {posts.map((post) => {
              const restaurant = restaurantById.get(post.restaurantId);
              return (
                <li key={post.id}>
                  <Card interactive className="h-full">
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
                        <p className="font-body text-label-sm text-on-surface-variant line-clamp-2 mt-0.5">
                          {post.caption}
                        </p>
                        <p className="font-body text-label-sm text-on-surface-variant/80 mt-2">
                          <span className="numeric">{formatNumber(post.likeCount)}</span> إعجاب ·{" "}
                          {timeAgo(post.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </Card>
                </li>
              );
            })}
          </ul>
        ))}

      {tab === "المحفوظات" && (
        <SavedClient restaurants={restaurants} items={items} posts={allPosts} />
      )}

      {tab === "التقييمات" &&
        (reviews.length === 0 ? (
          <EmptyState
            icon={ImageOff}
            title="لم تكتب تقييمات بعد"
            description="شارك رأيك بعد زيارتك القادمة."
            actionLabel="اكتشف أماكن جديدة"
            actionHref="/discover"
          />
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {reviews.map((review) => {
              const restaurant = restaurantById.get(review.restaurantId);
              return (
                <li key={review.id}>
                  <Card className="p-gutter h-full flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={restaurant ? `/restaurant/${restaurant.slug}` : "/"}
                        className="font-body text-label-md text-on-surface hover:text-primary transition-colors truncate"
                      >
                        {restaurant?.name ?? "مكان"}
                      </Link>
                      <StarRow value={review.rating} />
                    </div>
                    <p className="font-body text-body-md text-on-surface-variant">{review.comment}</p>
                    <p className="font-body text-label-sm text-on-surface-variant/80 mt-auto pt-2">
                      {timeAgo(review.createdAt)}
                    </p>
                  </Card>
                </li>
              );
            })}
          </ul>
        ))}
    </div>
  );
}
