"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { cn } from "@/lib/utils";
import type { Story } from "@/types";

/** فقاعة قصة دائرية بحلقة متدرجة (مرجان → أخضر غابي) تتحول إلى رمادي بعد المشاهدة. */
export function StoryBubble({ story, label }: { story: Story; label: string }) {
  const { isStorySeen, ready } = useAppState();
  const seen = ready && isStorySeen(story.id);

  return (
    <Link
      href={`/story/${story.id}`}
      className="flex flex-col items-center gap-2 shrink-0 w-16 group focus-visible:outline-none"
    >
      <span
        className={cn(
          "story-ring transition-shadow duration-200 group-hover:shadow-level-2",
          seen && "story-ring-seen",
        )}
      >
        <Image
          src={story.imageUrl}
          alt=""
          width={64}
          height={64}
          className="size-16 rounded-full object-cover border-2 border-surface transition-transform duration-200 group-hover:scale-[1.04]"
        />
      </span>
      <span className="font-body text-label-sm text-on-surface truncate w-full text-center">
        {label}
      </span>
    </Link>
  );
}

/** فقاعة "المزيد" في نهاية شريط القصص. */
export function MoreStoriesBubble({ href = "/discover" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 shrink-0 w-16 group"
      aria-label="اكتشف المزيد من القصص"
    >
      <span className="size-16 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-outline-variant/30 transition-colors group-hover:bg-surface-container-highest">
        <Plus className="size-6 text-on-surface-variant" aria-hidden />
      </span>
      <span className="font-body text-label-sm text-on-surface-variant truncate w-full text-center">
        المزيد
      </span>
    </Link>
  );
}
