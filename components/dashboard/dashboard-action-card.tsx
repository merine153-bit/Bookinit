import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary-container/20 text-primary",
  secondary: "bg-secondary-container/40 text-secondary",
  tertiary: "bg-tertiary-container/30 text-tertiary",
  outline: "bg-outline-variant/30 text-on-surface-variant",
};

/** بطاقة إجراء سريع في شبكة لوحة التحكم. */
export function DashboardActionCard({
  href,
  label,
  icon: Icon,
  tone = "primary",
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
}) {
  return (
    <Link
      href={href}
      className="group bg-surface-container-low rounded-xl p-stack-md flex flex-col items-center justify-center text-center shadow-level-1 hover:bg-surface-container-high/60 hover:shadow-level-2 transition-all aspect-square"
    >
      <span
        className={cn(
          "size-16 rounded-full flex items-center justify-center mb-stack-sm transition-transform group-hover:scale-110",
          TONES[tone],
        )}
      >
        <Icon className="size-7" aria-hidden />
      </span>
      <span className="font-body text-label-md text-on-surface">{label}</span>
    </Link>
  );
}
