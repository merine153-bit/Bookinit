import Image from "next/image";
import { MessageSquareQuote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StarRow } from "@/components/ui/rating";
import { EmptyState } from "@/components/ui/empty-state";
import { timeAgo } from "@/lib/utils";
import type { Review } from "@/types";

/** قائمة تقييمات المطعم. */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title="لا توجد تقييمات بعد"
        description="كن أول من يشارك تجربته في هذا المكان."
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      {reviews.map((review) => (
        <li key={review.id}>
          <Card className="p-gutter h-full flex flex-col gap-stack-md">
            <div className="flex items-center gap-3">
              <Image
                src={review.authorAvatar}
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="font-body text-label-md text-on-surface truncate">{review.authorName}</p>
                <div className="flex items-center gap-2">
                  <StarRow value={review.rating} />
                  <span className="font-body text-label-sm text-on-surface-variant">
                    {timeAgo(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <p className="font-body text-body-md text-on-surface-variant">{review.comment}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
