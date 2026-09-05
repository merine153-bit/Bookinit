import Image from "next/image";
import { Megaphone, Trash2 } from "lucide-react";
import { requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";
import { PostForm } from "@/components/dashboard/post-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { deletePostAction } from "@/app/actions/dashboard";
import { listPostsByRestaurant } from "@/lib/data/repository";
import { formatNumber, timeAgo } from "@/lib/utils";

export const metadata = { title: "المنشورات" };

export default async function DashboardPostsPage() {
  const restaurant = await requireDashboardRestaurant();
  const posts = await listPostsByRestaurant(restaurant.id);

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
      <div>
        <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
          المنشورات
        </h1>
        <p className="font-body text-body-md text-on-surface-variant mt-1">
          التحديثات التي تنشرها تظهر في التغذية الرئيسية لمتابعيك.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-stack-lg">
        <section aria-label="المنشورات المنشورة" className="mb-stack-lg lg:mb-0">
          <h2 className="font-display text-headline-md text-on-surface mb-stack-md">
            منشوراتك (<span className="numeric">{posts.length}</span>)
          </h2>

          {posts.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="لم تنشر تحديثات بعد"
              description="شارك جديد مطعمك مع متابعيك من النموذج المجاور."
            />
          ) : (
            <ul className="flex flex-col gap-gutter">
              {posts.map((post) => (
                <li key={post.id}>
                  <Card className="p-gutter flex flex-col sm:flex-row gap-gutter">
                    <div className="relative size-24 rounded-lg overflow-hidden shrink-0">
                      <Image src={post.imageUrl} alt="" fill sizes="96px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.badge && <Badge tone={post.badgeTone}>{post.badge}</Badge>}
                        <span className="font-body text-label-sm text-on-surface-variant">
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>
                      <p className="font-body text-body-md text-on-surface line-clamp-2">{post.caption}</p>
                      <p className="font-body text-label-sm text-on-surface-variant">
                        <span className="numeric">{formatNumber(post.likeCount)}</span> إعجاب ·{" "}
                        <span className="numeric">{formatNumber(post.commentCount)}</span> تعليق
                      </p>
                    </div>
                    <form action={deletePostAction} className="shrink-0">
                      <input type="hidden" name="id" value={post.id} />
                      <button
                        type="submit"
                        aria-label="حذف المنشور"
                        className="size-10 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors"
                      >
                        <Trash2 className="size-5" aria-hidden />
                      </button>
                    </form>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside aria-label="نشر تحديث جديد">
          <Card className="p-gutter lg:sticky lg:top-[96px]">
            <h2 className="font-display text-headline-md text-on-surface mb-stack-md">تحديث جديد</h2>
            <PostForm restaurantId={restaurant.id} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
