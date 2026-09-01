import { UtensilsCrossed } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import type { MenuCategory, MenuItem } from "@/types";
import { MenuItemCard } from "./menu-item-card";

/** قسم واحد من القائمة مع عنوانه وأصنافه. */
export function MenuSection({
  category,
  items,
  variant = "compact",
  restaurantName,
}: {
  category: MenuCategory;
  items: MenuItem[];
  variant?: "compact" | "featured";
  restaurantName?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section id={`category-${category.id}`} className="scroll-mt-40">
      <h2 className="font-display text-headline-md text-on-surface mb-stack-md">{category.name}</h2>
      <div
        className={
          variant === "featured"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-lg"
            : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter"
        }
      >
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            variant={variant}
            restaurantName={restaurantName}
          />
        ))}
      </div>
    </section>
  );
}

/** حالة "القائمة غير متاحة". */
export function MenuUnavailable({ restaurantName }: { restaurantName: string }) {
  return (
    <EmptyState
      icon={UtensilsCrossed}
      title="القائمة غير متاحة حالياً"
      description={`لم يقم ${restaurantName} بنشر قائمته الرقمية بعد. تابع المطعم ليصلك إشعار عند إضافتها.`}
    />
  );
}
