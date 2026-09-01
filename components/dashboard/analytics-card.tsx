import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

/** بطاقة مؤشر — رقم كبير بخط Montserrat مع أيقونة دائرية ملوّنة. */
export function AnalyticsCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "neutral";
  hint?: string;
}) {
  const tones = {
    primary: "bg-primary-container/15 text-primary",
    secondary: "bg-secondary-container/40 text-secondary",
    neutral: "bg-surface-container-high text-on-surface-variant",
  };

  return (
    <Card className="p-stack-lg flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="font-body text-label-md text-on-surface-variant mb-unit">{label}</p>
        <p className="numeric font-display text-display-lg text-on-surface leading-none">
          {typeof value === "number" ? formatNumber(value) : value}
        </p>
        {hint && <p className="font-body text-label-sm text-on-surface-variant mt-2">{hint}</p>}
      </div>
      <span className={cn("size-12 rounded-full flex items-center justify-center shrink-0", tones[tone])}>
        <Icon className="size-6" aria-hidden />
      </span>
    </Card>
  );
}
