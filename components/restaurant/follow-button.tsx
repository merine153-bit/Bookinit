"use client";

import { Check, Plus } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** زر متابعة المطعم — حالة "متابَع" تستخدم اللون الغابي الثانوي. */
export function FollowButton({
  restaurantId,
  restaurantName,
  className,
}: {
  restaurantId: string;
  restaurantName: string;
  className?: string;
}) {
  const { isFollowing, toggleFollow, ready } = useAppState();
  const toast = useToast();
  const following = ready && isFollowing(restaurantId);

  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={() => {
        const next = toggleFollow(restaurantId);
        toast(next ? `تتابع الآن ${restaurantName}` : `ألغيت متابعة ${restaurantName}`);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-label-md transition-all active:scale-95",
        following
          ? "bg-secondary-container text-on-secondary-container"
          : "bg-primary text-on-primary shadow-level-1 hover:bg-primary/90",
        className,
      )}
    >
      {following ? <Check className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
      {following ? "متابَع" : "متابعة"}
    </button>
  );
}
