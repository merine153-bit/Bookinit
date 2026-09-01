import Image from "next/image";
import { BarChart3, Eye, Heart, MessageSquare, Star, Users } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { Card } from "@/components/ui/card";
import { StarRow } from "@/components/ui/rating";
import { EmptyState } from "@/components/ui/empty-state";
import { listPostsByRestaurant, listReviews } from "@/lib/data/repository";
import { formatNumber, formatRating, timeAgo } from "@/lib/utils";

export const metadata = { title: "التحليلات" };

/** توزيع تقديري لنمو المتابعين خلال الأسبوع — يُستبدل ببيانات فعلية عند ربط Supabase. */
const WEEK_DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default async function AnalyticsPage() {
  const restaurant = await requireDashboardRestaurant();
  const [reviews, posts] = await Promise.all([
    listReviews(restaurant.id),
    listPostsByRestaurant(restaurant.id),
  ]);

  const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, restaurant.likeCount);
  const totalComments = posts.reduce((sum, post) => sum + post.commentCount, 0);

  // منحنى بسيط مشتق من عدد المتابعين لعرض الاتجاه الأسبوعي.
  const weekly = WEEK_DAYS.map((day, index) => ({
    day,
    value: Math.round((restaurant.followerCount / 60) * (0.6 + ((index * 7) % 11) / 12)),
  }));
  const maxWeekly = Math.max(...weekly.map((w) => w.value));

  const ratingBuckets = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => Math.round(review.rating) === stars).length,
  }));

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div>
        <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
          التحليلات
        </h1>
        <p className="font-body text-body-md text-on-surface-variant mt-1">
          أداء {restaurant.name} خلال الفترة الأخيرة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <AnalyticsCard label="إجمالي الإعجابات" value={totalLikes} icon={Heart} tone="primary" />
        <AnalyticsCard label="المتابعون" value={restaurant.followerCount} icon={Users} tone="secondary" />
        <AnalyticsCard label="التعليقات" value={totalComments} icon={MessageSquare} tone="neutral" />
        <AnalyticsCard
          label="متوسط التقييم"
          value={formatRating(restaurant.rating)}
          icon={Star}
          tone="neutral"
          hint={`${restaurant.reviewCount} تقييم`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <Card className="p-gutter">
          <h2 className="flex items-center gap-2 font-display text-headline-md text-on-surface mb-stack-lg">
            <BarChart3 className="size-5 text-primary" aria-hidden />
            متابعون جدد هذا الأسبوع
          </h2>
          <ul className="flex items-end justify-between gap-2 h-48">
            {weekly.map((entry) => (
              <li key={entry.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="numeric font-body text-label-sm text-on-surface-variant">
                  {entry.value}
                </span>
                <span
                  className="w-full rounded-t-lg bg-primary/80"
                  style={{ height: `${(entry.value / maxWeekly) * 100}%` }}
                  aria-hidden
                />
                <span className="font-body text-label-sm text-on-surface-variant truncate w-full text-center">
                  {entry.day}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-gutter">
          <h2 className="flex items-center gap-2 font-display text-headline-md text-on-surface mb-stack-lg">
            <Eye className="size-5 text-secondary" aria-hidden />
            توزيع التقييمات
          </h2>
          <ul className="flex flex-col gap-stack-md">
            {ratingBuckets.map((bucket) => {
              const percent = reviews.length ? (bucket.count / reviews.length) * 100 : 0;
              return (
                <li key={bucket.stars} className="flex items-center gap-3">
                  <span className="numeric font-body text-label-md text-on-surface-variant w-4">
                    {bucket.stars}
                  </span>
                  <Star className="size-4 fill-honey text-honey shrink-0" aria-hidden />
                  <span className="flex-1 h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-secondary"
                      style={{ width: `${percent}%` }}
                      aria-hidden
                    />
                  </span>
                  <span className="numeric font-body text-label-sm text-on-surface-variant w-8 text-start">
                    {bucket.count}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <section aria-label="أحدث التقييمات">
        <h2 className="font-display text-headline-md text-on-surface mb-stack-md">أحدث التقييمات</h2>
        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="لا توجد تقييمات بعد"
            description="ستظهر هنا تقييمات الضيوف فور نشرها."
          />
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {reviews.slice(0, 6).map((review) => (
              <li key={review.id}>
                <Card className="p-gutter flex gap-3 h-full">
                  <Image
                    src={review.authorAvatar}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body text-label-md text-on-surface">{review.authorName}</span>
                      <StarRow value={review.rating} />
                      <span className="font-body text-label-sm text-on-surface-variant">
                        {timeAgo(review.createdAt)}
                      </span>
                    </div>
                    <p className="font-body text-body-md text-on-surface-variant mt-1">{review.comment}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="أفضل المنشورات">
        <h2 className="font-display text-headline-md text-on-surface mb-stack-md">أفضل المنشورات أداءً</h2>
        {posts.length === 0 ? (
          <EmptyState icon={BarChart3} title="لا توجد منشورات لقياسها بعد" />
        ) : (
          <ul className="flex flex-col gap-gutter">
            {[...posts]
              .sort((a, b) => b.likeCount - a.likeCount)
              .slice(0, 5)
              .map((post) => (
                <li key={post.id}>
                  <Card className="p-gutter flex items-center gap-gutter">
                    <div className="relative size-16 rounded-lg overflow-hidden shrink-0">
                      <Image src={post.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <p className="flex-1 min-w-0 font-body text-body-md text-on-surface line-clamp-2">
                      {post.caption}
                    </p>
                    <span className="numeric shrink-0 font-display text-headline-md text-primary">
                      {formatNumber(post.likeCount)}
                    </span>
                  </Card>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
