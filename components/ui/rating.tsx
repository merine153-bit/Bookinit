import { Star } from "lucide-react";
import { cn, formatRating } from "@/lib/utils";

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStars?: boolean;
}

const SIZES = {
  sm: { icon: "size-3.5", text: "text-label-sm" },
  md: { icon: "size-4", text: "text-label-md" },
  lg: { icon: "size-5", text: "text-body-lg font-semibold" },
};

/** نجمة "Honey Gold" مع الرقم — العنصر البصري المميز للتقييم في Eatit. */
export function Rating({ value, reviewCount, size = "md", className, showStars = true }: RatingProps) {
  const s = SIZES[size];
  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`التقييم ${formatRating(value)} من 5${reviewCount ? ` بناءً على ${reviewCount} تقييم` : ""}`}
    >
      {showStars && <Star className={cn(s.icon, "fill-honey text-honey shrink-0")} aria-hidden />}
      <span className={cn("numeric font-semibold text-on-surface", s.text)}>{formatRating(value)}</span>
      {reviewCount !== undefined && (
        <span className="text-label-sm text-on-surface-variant">
          (<span className="numeric">{reviewCount}</span> تقييم)
        </span>
      )}
    </div>
  );
}

/** خمس نجوم ممتلئة/فارغة — تُستخدم في قائمة المراجعات. */
export function StarRow({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value} من 5 نجوم`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("size-3.5", i < Math.round(value) ? "fill-honey text-honey" : "text-surface-variant")}
        />
      ))}
    </div>
  );
}
