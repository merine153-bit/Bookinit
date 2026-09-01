"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { cn, formatNumber } from "@/lib/utils";

/** زر الإعجاب — نبضة صغيرة عند التفعيل، والعدّاد يتحدث فوراً. */
export function LikeButton({
  postId,
  baseCount,
  className,
}: {
  postId: string;
  baseCount: number;
  className?: string;
}) {
  const { isLiked, toggleLike, ready } = useAppState();
  const [pulse, setPulse] = React.useState(false);
  const liked = ready && isLiked(postId);
  const count = baseCount + (liked ? 1 : 0);

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "إلغاء الإعجاب" : "إعجاب"}
      onClick={() => {
        const next = toggleLike(postId);
        if (next) {
          setPulse(true);
          window.setTimeout(() => setPulse(false), 260);
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors",
        liked ? "text-primary-container" : "text-on-surface-variant hover:text-primary-container",
        className,
      )}
    >
      <Heart
        className={cn("size-6", pulse && "animate-pop")}
        fill={liked ? "currentColor" : "none"}
        aria-hidden
      />
      <span className="numeric font-body text-label-sm">{formatNumber(count)}</span>
    </button>
  );
}
