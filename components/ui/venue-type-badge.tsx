import { Coffee, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { venueTypeOf } from "@/lib/venue";

/**
 * شارة نوع المكان (مقهى / مطعم).
 * تتبع ألوان علامات الخريطة: أخضر غابي للمقاهي ومرجاني للمطاعم،
 * فيتعرّف المستخدم على النوع بالشكل قبل قراءة النص.
 */
export function VenueTypeBadge({
  category,
  size = "md",
  className,
}: {
  category: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const type = venueTypeOf(category);
  const isCafe = type === "مقهى";
  const Icon = isCafe ? Coffee : UtensilsCrossed;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-label-sm" : "px-3 py-1.5 text-label-md",
        isCafe
          ? "bg-secondary-container/70 text-on-secondary-container"
          : "bg-primary-fixed text-on-primary-fixed",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
      {type}
    </span>
  );
}
