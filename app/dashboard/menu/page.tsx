import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { CategoryForm } from "@/components/dashboard/category-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { deleteMenuItemAction, moveMenuItemAction } from "@/app/actions/dashboard";
import { listMenuCategories, listMenuItems } from "@/lib/data/repository";
import { cn, formatPrice } from "@/lib/utils";

export const metadata = { title: "إدارة القائمة" };

export default async function DashboardMenuPage() {
  const restaurant = await requireDashboardRestaurant();
  const [categories, items] = await Promise.all([
    listMenuCategories(restaurant.id),
    listMenuItems(restaurant.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
            القائمة
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            <span className="numeric">{items.length}</span> صنفاً في{" "}
            <span className="numeric">{categories.length}</span> أقسام.
          </p>
        </div>
        <div className="flex gap-3">
          <CategoryForm />
          <Link
            href="/dashboard/menu/new"
            className={cn(buttonVariants({ variant: "primary", size: "md", pill: true }))}
          >
            <Plus className="size-5" aria-hidden />
            إضافة صنف
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="لم تُنشئ أقساماً بعد"
          description="ابدأ بإضافة قسم مثل «أطباق رئيسية» ثم أضف أصنافك إليه."
        />
      ) : (
        categories.map((category) => {
          const categoryItems = items.filter((item) => item.categoryId === category.id);
          return (
            <section key={category.id} aria-label={category.name}>
              <div className="flex items-center justify-between mb-stack-md">
                <h2 className="font-display text-headline-md text-on-surface">{category.name}</h2>
                <span className="font-body text-label-sm text-on-surface-variant">
                  <span className="numeric">{categoryItems.length}</span> صنف
                </span>
              </div>

              {categoryItems.length === 0 ? (
                <Card className="p-gutter">
                  <p className="font-body text-body-md text-on-surface-variant text-center py-4">
                    لا توجد أصناف في هذا القسم بعد.
                  </p>
                </Card>
              ) : (
                <ul className="flex flex-col gap-gutter">
                  {categoryItems.map((item, index) => (
                    <li key={item.id}>
                      <Card className="p-gutter flex flex-col sm:flex-row sm:items-center gap-gutter">
                        <div className="relative size-20 rounded-lg overflow-hidden shrink-0">
                          <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-body text-label-md text-on-surface">{item.name}</h3>
                            {!item.isAvailable && <Badge tone="neutral">غير متوفر</Badge>}
                            {item.tags.map((tag) => (
                              <Badge key={tag} tone="forest">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="font-body text-label-sm text-on-surface-variant line-clamp-1 mt-1">
                            {item.description}
                          </p>
                          <p className="numeric font-display text-label-md font-bold text-primary mt-1">
                            {formatPrice(item.price, item.currency)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <form action={moveMenuItemAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="direction" value="-1" />
                            <button
                              type="submit"
                              disabled={index === 0}
                              aria-label={`تحريك ${item.name} لأعلى`}
                              className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                            >
                              <ChevronUp className="size-5" aria-hidden />
                            </button>
                          </form>
                          <form action={moveMenuItemAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="direction" value="1" />
                            <button
                              type="submit"
                              disabled={index === categoryItems.length - 1}
                              aria-label={`تحريك ${item.name} لأسفل`}
                              className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                            >
                              <ChevronDown className="size-5" aria-hidden />
                            </button>
                          </form>
                          <Link
                            href={`/dashboard/menu/${item.id}`}
                            aria-label={`تعديل ${item.name}`}
                            className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            <Pencil className="size-5" aria-hidden />
                          </Link>
                          <form action={deleteMenuItemAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              aria-label={`حذف ${item.name}`}
                              className="size-9 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors"
                            >
                              <Trash2 className="size-5" aria-hidden />
                            </button>
                          </form>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
