"use client";

import * as React from "react";
import Image from "next/image";
import { MessageCircle, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import type { PostComment } from "@/types";

/** درج التعليقات — يفتح من زر التعليق أسفل كل منشور. */
export function CommentsDrawer({
  postId,
  restaurantName,
  comments,
  count,
}: {
  postId: string;
  restaurantName: string;
  comments: PostComment[];
  count: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [local, setLocal] = React.useState<PostComment[]>([]);
  const all = [...local, ...comments];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setLocal((current) => [
      {
        id: `local-${Date.now()}`,
        postId,
        authorName: "أنت",
        authorAvatar: "/images/u-1.jpg",
        body,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setDraft("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`التعليقات (${count + local.length})`}
        className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <MessageCircle className="size-6" aria-hidden />
        <span className="numeric font-body text-label-sm">{formatNumber(count + local.length)}</span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="التعليقات"
        description={restaurantName}
        variant="drawer"
      >
        <form onSubmit={submit} className="flex items-center gap-2 mb-stack-lg">
          <Input
            data-autofocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="اكتب تعليقاً…"
            aria-label="اكتب تعليقاً"
          />
          <Button type="submit" size="icon" aria-label="إرسال التعليق" disabled={!draft.trim()}>
            <Send className="size-5" aria-hidden />
          </Button>
        </form>

        {all.length === 0 ? (
          <p className="font-body text-body-md text-on-surface-variant text-center py-8">
            لا توجد تعليقات بعد — كن أول من يعلّق.
          </p>
        ) : (
          <ul className="flex flex-col gap-stack-lg">
            {all.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <Image
                  src={comment.authorAvatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover shrink-0"
                />
                <div className={cn("flex-1 min-w-0")}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-body text-label-md text-on-surface">{comment.authorName}</span>
                    <span className="font-body text-label-sm text-on-surface-variant">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="font-body text-body-md text-on-surface-variant mt-0.5">{comment.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
