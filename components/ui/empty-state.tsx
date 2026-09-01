import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  tone?: "neutral" | "error";
}

/** حالة فارغة أو خطأ — رسائل عربية واضحة مع إجراء واحد واضح. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  tone = "neutral",
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-16 px-container-margin", className)}>
      <div
        className={cn(
          "size-20 rounded-full flex items-center justify-center mb-stack-lg",
          tone === "error" ? "bg-error-container" : "bg-surface-container",
        )}
      >
        <Icon
          className={cn("size-9", tone === "error" ? "text-on-error-container" : "text-on-surface-variant")}
          aria-hidden
        />
      </div>
      <h2 className="font-display text-headline-md text-on-surface text-balance">{title}</h2>
      {description && (
        <p className="font-body text-body-md text-on-surface-variant mt-unit max-w-sm text-balance">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={cn(buttonVariants({ variant: "primary", size: "lg", pill: true }), "mt-stack-lg")}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
