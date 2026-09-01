import { MoreStoriesBubble, StoryBubble } from "./story-bubble";
import { cn } from "@/lib/utils";
import type { Restaurant, Story } from "@/types";

/** شريط القصص الأفقي أعلى الصفحة الرئيسية. */
export function StoryRow({
  stories,
  restaurants,
  className,
}: {
  stories: Story[];
  restaurants: Map<string, Restaurant>;
  className?: string;
}) {
  if (stories.length === 0) return null;

  return (
    <section aria-label="قصص المطاعم" className={cn("w-full", className)}>
      <ul className="flex gap-4 overflow-x-auto hide-scrollbar px-container-margin pb-2">
        {stories.map((story) => (
          <li key={story.id}>
            <StoryBubble
              story={story}
              label={story.title || restaurants.get(story.restaurantId)?.name || "قصة"}
            />
          </li>
        ))}
        <li>
          <MoreStoriesBubble />
        </li>
      </ul>
    </section>
  );
}
