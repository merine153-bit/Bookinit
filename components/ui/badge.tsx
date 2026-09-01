import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "new" | "popular" | "forest" | "neutral" | "primary";

const TONES: Record<Tone, string> = {
  new: "bg-secondary-container/80 text-on-secondary-container backdrop-blur-sm",
  popular:
    "bg-surface-container-high/80 text-on-surface-variant backdrop-blur-sm border border-outline-variant/30",
  forest: "bg-secondary-container/60 text-on-secondary-container",
  neutral: "bg-surface-container text-on-surface-variant",
  primary: "bg-primary text-on-primary",
};

/** شارة صغيرة — تُستخدم للفئات والوسوم مثل "نباتي" و"الأكثر طلباً". */
export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-label-sm whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
