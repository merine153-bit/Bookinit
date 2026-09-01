import Image from "next/image";
import { Clapperboard, Trash2 } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { StoryForm } from "@/components/dashboard/story-form";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteStoryAction } from "@/app/actions/dashboard";
import { listStoriesByRestaurant } from "@/lib/data/repository";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "القصص" };

export default async function DashboardStoriesPage() {
  const restaurant = await requireDashboardRestaurant();
  const stories = await listStoriesByRestaurant(restaurant.id);

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div>
        <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
          القصص
        </h1>
        <p className="font-body text-body-md text-on-surface-variant mt-1">
          القصص تظهر أعلى الصفحة الرئيسية وتختفي تلقائياً بعد 24 ساعة.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-stack-lg">
        <section aria-label="القصص المنشورة" className="mb-stack-lg lg:mb-0">
          <h2 className="font-display text-headline-md text-on-surface mb-stack-md">
            القصص النشطة (<span className="numeric">{stories.length}</span>)
          </h2>

          {stories.length === 0 ? (
            <EmptyState
              icon={Clapperboard}
              title="لا توجد قصص نشطة"
              description="انشر قصة لتظهر لمتابعيك خلال الـ24 ساعة القادمة."
            />
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-gutter">
              {stories.map((story) => (
                <li key={story.id}>
                  <Card className="h-full flex flex-col">
                    <div className="relative aspect-[9/16]">
                      <Image
                        src={story.imageUrl}
                        alt={story.caption}
                        fill
                        sizes="(max-width: 640px) 50vw, 220px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-gutter flex flex-col gap-2 flex-1">
                      <p className="font-body text-label-md text-on-surface truncate">{story.title}</p>
                      <p className="font-body text-label-sm text-on-surface-variant line-clamp-2">
                        {story.caption}
                      </p>
                      <p className="font-body text-label-sm text-on-surface-variant/80 mt-auto">
                        نُشرت {timeAgo(story.createdAt)}
                      </p>
                      <form action={deleteStoryAction}>
                        <input type="hidden" name="id" value={story.id} />
                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-error hover:bg-error-container transition-colors font-body text-label-sm"
                        >
                          <Trash2 className="size-4" aria-hidden />
                          حذف القصة
                        </button>
                      </form>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside aria-label="نشر قصة جديدة">
          <Card className="p-gutter lg:sticky lg:top-[96px]">
            <h2 className="font-display text-headline-md text-on-surface mb-stack-md">قصة جديدة</h2>
            <StoryForm defaultTitle={restaurant.name} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
