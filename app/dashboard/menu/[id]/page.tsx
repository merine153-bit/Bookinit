import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { MenuItemForm } from "@/components/dashboard/menu-item-form";
import { getMenuItem, listMenuCategories } from "@/lib/data/repository";

export const metadata = { title: "تعديل صنف" };

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, restaurant] = await Promise.all([params, requireDashboardRestaurant()]);
  const item = await getMenuItem(id);
  if (!item || item.restaurantId !== restaurant.id) notFound();

  const categories = await listMenuCategories(restaurant.id);

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
          تعديل «{item.name}»
        </h1>
      </div>

      <MenuItemForm categories={categories} item={item} />
    </div>
  );
}
