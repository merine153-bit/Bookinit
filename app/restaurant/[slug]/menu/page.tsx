import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MenuCategoryTabs } from "@/components/menu/menu-category-tabs";
import { MenuSection, MenuUnavailable } from "@/components/menu/menu-section";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { getRestaurantBySlug, listMenuCategories, listMenuItems } from "@/lib/data/repository";
import { cn, formatClock, openingStatus } from "@/lib/utils";

const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "القائمة غير متاحة" };
  return {
    title: `قائمة ${restaurant.name}`,
    description: `تصفّح القائمة الرقمية الكاملة لـ${restaurant.name}.`,
  };
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const [categories, items] = await Promise.all([
    listMenuCategories(restaurant.id),
    listMenuItems(restaurant.id),
  ]);
  const status = openingStatus(restaurant.hours);

  return (
    <AppShell>
      {/* رأس مختصر للقائمة */}
      <div className="bg-surface-container-low border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex items-center gap-4">
          <Link
            href={`/restaurant/${restaurant.slug}`}
            aria-label={`العودة إلى ملف ${restaurant.name}`}
            className="size-10 rounded-full bg-surface-container-lowest shadow-level-1 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <Image
            src={restaurant.logoUrl}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-headline-md text-on-surface truncate">
              قائمة {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <Rating value={restaurant.rating} reviewCount={restaurant.reviewCount} size="sm" />
              <span className="text-tertiary-container" aria-hidden>•</span>
              <span
                className={cn(
                  "font-body text-label-sm font-semibold",
                  status.isOpen ? "text-secondary" : "text-error",
                )}
              >
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {categories.length > 0 && <MenuCategoryTabs categories={categories} />}

      <div className="max-w-7xl mx-auto px-container-margin py-stack-lg">
        {categories.length === 0 || items.length === 0 ? (
          <MenuUnavailable restaurantName={restaurant.name} />
        ) : (
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-stack-lg">
            <div className="flex flex-col gap-stack-lg">
              {categories.map((category) => (
                <MenuSection
                  key={category.id}
                  category={category}
                  items={items.filter((item) => item.categoryId === category.id)}
                  variant="featured"
                  restaurantName={restaurant.name}
                />
              ))}
            </div>

            {/* لوحة معلومات المطعم — سطح المكتب */}
            <aside className="hidden lg:flex flex-col gap-gutter sticky top-[140px] self-start">
              <Card className="p-gutter flex flex-col gap-stack-md">
                <h2 className="font-display text-label-md text-on-surface">معلومات المكان</h2>
                <p className="font-body text-body-md text-on-surface-variant">
                  {restaurant.shortDescription}
                </p>
                <div className="flex flex-wrap gap-2">
                  {restaurant.tags.map((tag) => (
                    <Badge key={tag} tone="forest">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-start gap-2 font-body text-label-md text-on-surface-variant">
                  <MapPin className="size-4 mt-1 shrink-0" aria-hidden />
                  <span>
                    {restaurant.address}، {restaurant.city}
                  </span>
                </div>
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 font-body text-label-md text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <Phone className="size-4 shrink-0" aria-hidden />
                    <span dir="ltr">{restaurant.phone}</span>
                  </a>
                )}
              </Card>

              <Card className="p-gutter">
                <h2 className="flex items-center gap-2 font-display text-label-md text-on-surface mb-stack-md">
                  <Clock className="size-4" aria-hidden />
                  ساعات العمل
                </h2>
                <ul className="flex flex-col gap-2">
                  {restaurant.hours.map((hour) => (
                    <li
                      key={hour.dayOfWeek}
                      className="flex items-center justify-between font-body text-label-sm text-on-surface-variant"
                    >
                      <span>{DAY_NAMES[hour.dayOfWeek]}</span>
                      {hour.isClosed ? (
                        <span>مغلق</span>
                      ) : (
                        <span>
                          من <bdi className="numeric">{formatClock(hour.opensAt)}</bdi> إلى{" "}
                          <bdi className="numeric">{formatClock(hour.closesAt)}</bdi>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}
