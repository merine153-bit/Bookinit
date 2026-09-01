import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Post, PostComment, Restaurant } from "@/types";
import { CommentsDrawer } from "./comments-drawer";
import { LikeButton } from "./like-button";
import { PostActionsMenu } from "./post-actions-menu";
import { SaveButton } from "./save-button";

interface SocialPostCardProps {
  post: Post;
  restaurant: Restaurant;
  comments: PostComment[];
  /** المنشور الأول في التغذية يستخدم زر CTA أساسي، والتالي نسخة أهدأ. */
  emphasis?: "primary" | "secondary";
  priority?: boolean;
}

/** بطاقة المنشور الاجتماعي — العمود الفقري للصفحة الرئيسية. */
export function SocialPostCard({
  post,
  restaurant,
  comments,
  emphasis = "primary",
  priority = false,
}: SocialPostCardProps) {
  return (
    <article className="bg-surface rounded-xl shadow-level-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-gutter">
        <Link href={`/restaurant/${restaurant.slug}`} className="flex items-center gap-3 group min-w-0">
          <Image
            src={restaurant.logoUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-cover shrink-0"
          />
          <span className="min-w-0">
            <span className="block font-body text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
              {restaurant.name}
            </span>
            <span className="flex items-center gap-1 font-body text-label-sm text-on-surface-variant truncate">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {restaurant.city}، {restaurant.address.split("،").pop()?.trim()}
            </span>
          </span>
        </Link>
        <PostActionsMenu
          postId={post.id}
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
        />
      </div>

      <Link
        href={`/restaurant/${restaurant.slug}/menu`}
        className="relative aspect-[4/5] w-full block group"
        aria-label={`صورة من ${restaurant.name} — افتح القائمة`}
      >
        <Image
          src={post.imageUrl}
          alt={`طبق من ${restaurant.name}`}
          fill
          sizes="(max-width: 768px) 100vw, 680px"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {post.badge && (
          <span className="absolute bottom-gutter end-gutter">
            <Badge tone={post.badgeTone}>{post.badge}</Badge>
          </span>
        )}
      </Link>

      <div className="p-gutter flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Rating value={restaurant.rating} />
          <div className="flex items-center gap-4">
            <CommentsDrawer
              postId={post.id}
              restaurantName={restaurant.name}
              comments={comments}
              count={post.commentCount}
            />
            <LikeButton postId={post.id} baseCount={post.likeCount} />
            <SaveButton type="post" id={post.id} />
          </div>
        </div>

        <p className="font-body text-body-md text-on-surface">
          <Link
            href={`/restaurant/${restaurant.slug}`}
            className="font-semibold text-label-md me-1 hover:text-primary transition-colors"
          >
            {restaurant.name}
          </Link>
          {post.caption}
        </p>

        <Link
          href={`/restaurant/${restaurant.slug}/menu`}
          className={cn(
            buttonVariants({
              variant: emphasis === "primary" ? "primary" : "secondary",
              size: "full",
            }),
            "mt-unit",
          )}
        >
          <span>استكشف القائمة</span>
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
