import * as React from "react";
import { cn } from "@/lib/utils";

/** البطاقة الأساسية: زوايا ناعمة، ظل خفيف، خلفية دافئة. */
export function Card({
  className,
  as: Tag = "div",
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  interactive?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden",
        interactive && "transition-all duration-200 hover:shadow-level-2 hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-gutter", className)} {...props} />;
}

export function SectionTitle({
  className,
  children,
  action,
}: {
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 mb-stack-md", className)}>
      <h2 className="font-display text-headline-md text-on-surface">{children}</h2>
      {action}
    </div>
  );
}
