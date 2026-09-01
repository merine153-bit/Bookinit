import { PostCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-dvh">
      <div className="h-[72px] glass border-b border-outline-variant/20" />
      <div className="max-w-[680px] mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
        <div className="flex gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="size-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  );
}
