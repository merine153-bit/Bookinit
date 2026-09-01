import { Newspaper } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StoryRow } from "@/components/home/story-row";
import { DiscoverySidebar } from "@/components/home/discovery-sidebar";
import { SocialPostCard } from "@/components/social/social-post-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getRestaurantMap,
  listCommentsForPosts,
  listPosts,
  listRestaurants,
  listStories,
} from "@/lib/data/repository";

export const metadata = {
  title: "الرئيسية",
  description: "تغذية اجتماعية لأحدث الأطباق والتجارب من مطاعم ومقاهي حولك.",
};

export default async function HomePage() {
  const [posts, stories, restaurantMap, restaurants] = await Promise.all([
    listPosts(15),
    listStories(),
    getRestaurantMap(),
    listRestaurants({ sort: "rating" }),
  ]);
  const commentsByPost = await listCommentsForPosts(posts.map((p) => p.id));

  return (
    <AppShell>
      <div className="py-stack-lg">
        <h1 className="sr-only">أحدث المنشورات من المطاعم والمقاهي التي تتابعها</h1>
        <StoryRow
          stories={stories}
          restaurants={restaurantMap}
          className="mb-stack-lg mx-auto max-w-[720px] lg:max-w-7xl"
        />

        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,680px)_320px] lg:gap-stack-lg lg:justify-center lg:px-container-margin">
          <div className="mx-auto flex w-full max-w-[680px] flex-col gap-stack-lg px-container-margin lg:mx-0 lg:max-w-none lg:px-0">
            {posts.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title="لا توجد منشورات بعد"
                description="تابع مطاعمك المفضلة ليظهر جديدها هنا."
                actionLabel="اكتشف أماكن جديدة"
                actionHref="/discover"
              />
            ) : (
              posts.map((post, index) => {
                const restaurant = restaurantMap.get(post.restaurantId);
                if (!restaurant) return null;
                return (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    restaurant={restaurant}
                    comments={commentsByPost[post.id] ?? []}
                    emphasis={index % 2 === 0 ? "primary" : "secondary"}
                    priority={index === 0}
                  />
                );
              })
            )}
          </div>

          <DiscoverySidebar restaurants={restaurants} />
        </div>
      </div>
    </AppShell>
  );
}
