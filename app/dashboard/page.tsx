import Link from "next/link";
import { BarChart3, Clapperboard, Heart, Megaphone, Plus, Star, Users, UtensilsCrossed } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { DashboardActionCard } from "@/components/dashboard/dashboard-action-card";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { ActivityList } from "@/components/dashboard/activity-list";
import { buttonVariants } from "@/components/ui/button";
import { listActivity, listMenuItems, listReviews } from "@/lib/data/repository";
import { cn, formatRating } from "@/lib/utils";

export default async function DashboardHome() {
  const restaurant = await requireDashboardRestaurant();
  const [activity, items, reviews] = await Promise.all([
    listActivity(),
    listMenuItems(restaurant.id),
    listReviews(restaurant.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface mb-stack-sm">
            مرحباً، {restaurant.name}
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            نظرة عامة على أداء متجرك اليوم.
          </p>
        </div>
        <Link
          href="/dashboard/posts"
          className={cn(buttonVariants({ variant: "primary", size: "lg", pill: true }), "shrink-0")}
        >
          <Plus className="size-5" aria-hidden />
          إضافة تحديث
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <DashboardActionCard href="/dashboard/stories" label="إضافة قصة" icon={Clapperboard} tone="primary" />
        <DashboardActionCard href="/dashboard/menu" label="تعديل القائمة" icon={UtensilsCrossed} tone="secondary" />
        <DashboardActionCard href="/dashboard/posts" label="نشر تحديث" icon={Megaphone} tone="tertiary" />
        <DashboardActionCard href="/dashboard/analytics" label="التحليلات" icon={BarChart3} tone="outline" />
      </div>

      <section aria-label="نظرة عامة على الأداء">
        <h2 className="font-display text-headline-md text-on-surface mb-stack-md">نظرة عامة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <AnalyticsCard label="إجمالي الإعجابات" value={restaurant.likeCount} icon={Heart} tone="primary" />
          <AnalyticsCard label="المتابعون" value={restaurant.followerCount} icon={Users} tone="secondary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-gutter">
          <AnalyticsCard
            label="متوسط التقييم"
            value={formatRating(restaurant.rating)}
            icon={Star}
            tone="neutral"
            hint={`من ${restaurant.reviewCount} تقييم`}
          />
          <AnalyticsCard
            label="أصناف القائمة"
            value={items.length}
            icon={UtensilsCrossed}
            tone="neutral"
            hint={`${reviews.length} تقييم منشور`}
          />
        </div>
      </section>

      <section aria-label="النشاط الأخير">
        <h2 className="font-display text-headline-md text-on-surface mb-stack-md">النشاط الأخير</h2>
        <ActivityList items={activity} />
      </section>
    </div>
  );
}
