import { cn } from "@/lib/utils";

/** هيكل تحميل متوهّج بلون دافئ متناسق مع الخلفية. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-lg bg-[linear-gradient(90deg,var(--color-surface-container)_25%,var(--color-surface-container-high)_37%,var(--color-surface-container)_63%)] bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden">
      <div className="flex items-center gap-3 p-gutter">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="p-gutter space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-gutter space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-level-1 p-gutter flex gap-4">
      <Skeleton className="size-24 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-4 w-16 mt-2" />
      </div>
    </div>
  );
}
