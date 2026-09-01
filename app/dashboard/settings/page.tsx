import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Card } from "@/components/ui/card";
import { formatClock } from "@/lib/utils";

export const metadata = { title: "إعدادات المطعم" };

const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default async function SettingsPage() {
  const restaurant = await requireDashboardRestaurant();

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
            إعدادات المطعم
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            هذه البيانات تظهر لزوّار ملفك في Eatit.
          </p>
        </div>
        <Link
          href={`/restaurant/${restaurant.slug}`}
          className="inline-flex items-center gap-2 font-body text-label-md text-secondary hover:underline shrink-0"
        >
          <ExternalLink className="size-5" aria-hidden />
          معاينة الملف العام
        </Link>
      </div>

      <SettingsForm restaurant={restaurant} />

      <Card className="p-gutter max-w-3xl">
        <h2 className="font-display text-headline-md text-on-surface mb-stack-md">ساعات العمل</h2>
        <ul className="flex flex-col gap-2">
          {restaurant.hours.map((hour) => (
            <li
              key={hour.dayOfWeek}
              className="flex items-center justify-between font-body text-label-md text-on-surface-variant border-b border-outline-variant/20 pb-2 last:border-0"
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
        <p className="font-body text-label-sm text-on-surface-variant mt-stack-md">
          لتعديل ساعات العمل حدّث جدول <code dir="ltr">restaurant_hours</code> في قاعدة البيانات، أو
          تواصل مع الدعم.
        </p>
      </Card>
    </div>
  );
}
