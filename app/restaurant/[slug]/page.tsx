import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Newspaper } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { RestaurantHero } from "@/components/restaurant/restaurant-hero";
import { ReviewList } from "@/components/restaurant/review-list";
import { StoryBubble } from "@/components/home/story-bubble";
import { MenuCategoryTabs } from "@/components/menu/menu-category-tabs";
import { MenuSection, MenuUnavailable } from "@/components/menu/menu-section";
import { SocialPostCard } from "@/components/social/social-post-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getRestaurantBySlug,
  listCommentsForPosts,
  listMenuCategories,
  listMenuItems,
  listPostsByRestaurant,
  listReviews,
  listStoriesByRestaurant,
} from "@/lib/data/repository";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "المطعم غير موجود" };
  return {
    title: restaurant.name,
    description: restaurant.shortDescription,
    openGraph: { images: [restaurant.coverUrl] },
  };
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const [categories, items, reviews, stories, posts] = await Promise.all([
    listMenuCategories(restaurant.id),
    listMenuItems(restaurant.id),
    listReviews(restaurant.id),
    listStoriesByRestaurant(restaurant.id),
    listPostsByRestaurant(restaurant.id),
  ]);
  const commentsByPost = await listCommentsForPosts(posts.map((p) => p.id));

  return (
    <AppShell>
      <RestaurantHero restaurant={restaurant} />

      {stories.length > 0 && (
        <section
          aria-label={`قصص ${restaurant.name}`}
          className="max-w-7xl mx-auto px-container-margin pb-stack-lg"
        >
          <h2 className="font-display text-headline-md text-on-surface mb-stack-md">القصص</h2>
          <ul className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {stories.map((story) => (
              <li key={story.id}>
                <StoryBubble story={story} label={story.title} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {categories.length > 0 && <MenuCategoryTabs categories={categories} />}

      <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
        {categories.length === 0 || items.length === 0 ? (
          <MenuUnavailable restaurantName={restaurant.name} />
        ) : (
          <>
            {categories.map((category) => (
              <MenuSection
                key={category.id}
                category={category}
                items={items.filter((item) => item.categoryId === category.id)}
                restaurantName={restaurant.name}
              />
            ))}
            <Link
              href={`/restaurant/${restaurant.slug}/menu`}
              className={cn(buttonVariants({ variant: "primary", size: "full" }), "sm:max-w-sm sm:mx-auto")}
            >
              عرض القائمة الكاملة
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
          </>
        )}

        {posts.length > 0 && (
          <section aria-label={`منشورات ${restaurant.name}`} className="pt-stack-lg">
            <h2 className="flex items-center gap-2 font-display text-headline-md text-on-surface mb-stack-md">
              <Newspaper className="size-6 text-primary" aria-hidden />
              آخر المنشورات
            </h2>
            <div className="flex flex-col gap-stack-lg max-w-[680px]">
              {posts.slice(0, 3).map((post) => (
                <SocialPostCard
                  key={post.id}
                  post={post}
                  restaurant={restaurant}
                  comments={commentsByPost[post.id] ?? []}
                />
              ))}
            </div>
          </section>
        )}

        <section aria-label={`تقييمات ${restaurant.name}`} className="pt-stack-lg">
          <h2 className="flex items-center gap-2 font-display text-headline-md text-on-surface mb-stack-md">
            <MessageSquare className="size-6 text-secondary" aria-hidden />
            التقييمات (<span className="numeric">{reviews.length}</span>)
          </h2>
          <ReviewList reviews={reviews} />
        </section>
      </div>
    </AppShell>
  );
}
