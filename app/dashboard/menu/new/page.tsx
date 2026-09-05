import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { MenuItemForm } from "@/components/dashboard/menu-item-form";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderPlus } from "lucide-react";
import { listMenuCategories, listMenuItems } from "@/lib/data/repository";

export const metadata = { title: "إضافة صنف" };

export default async function NewMenuItemPage() {
  const restaurant = await requireDashboardRestaurant();
  const [categories, items] = await Promise.all([
    listMenuCategories(restaurant.id),
    listMenuItems(restaurant.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/menu"
          aria-label="العودة إلى القائمة"
          className="size-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowRight className="size-5" aria-hidden />
        </Link>
        <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
          إضافة صنف جديد
        </h1>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="أضف قسماً أولاً"
          description="كل صنف يجب أن ينتمي إلى قسم داخل القائمة."
          actionLabel="العودة إلى القائمة"
          actionHref="/dashboard/menu"
        />
      ) : (
        <MenuItemForm
          categories={categories}
          restaurantId={restaurant.id}
          defaultCurrency={items[0]?.currency ?? "ر.س"}
        />
      )}
    </div>
  );
}
