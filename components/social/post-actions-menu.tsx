"use client";

import * as React from "react";
import Link from "next/link";
import { Flag, MoreHorizontal, Share2, Store, UtensilsCrossed } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { SaveButton } from "./save-button";

/** قائمة النقاط الثلاث فوق كل منشور. */
export function PostActionsMenu({
  postId,
  restaurantSlug,
  restaurantName,
}: {
  postId: string;
  restaurantSlug: string;
  restaurantName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const toast = useToast();

  const share = async () => {
    const url = `${window.location.origin}/restaurant/${restaurantSlug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: restaurantName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("تم نسخ الرابط");
      }
      setOpen(false);
    } catch {
      // أُلغيت المشاركة من المستخدم — لا حاجة لرسالة.
    }
  };

  const rowClass =
    "flex items-center gap-3 w-full py-4 font-body text-body-md text-on-surface hover:text-primary transition-colors text-start";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`خيارات منشور ${restaurantName}`}
        className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high/60 transition-colors"
      >
        <MoreHorizontal className="size-6" aria-hidden />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={restaurantName} variant="drawer">
        <div className="flex flex-col divide-y divide-outline-variant/20">
          <Link href={`/restaurant/${restaurantSlug}`} className={rowClass} onClick={() => setOpen(false)}>
            <Store className="size-5 text-on-surface-variant" aria-hidden />
            عرض ملف المطعم
          </Link>
          <Link
            href={`/restaurant/${restaurantSlug}/menu`}
            className={rowClass}
            onClick={() => setOpen(false)}
          >
            <UtensilsCrossed className="size-5 text-on-surface-variant" aria-hidden />
            استكشف القائمة
          </Link>
          <div className="py-2">
            <SaveButton type="post" id={postId} withLabel className="w-full py-2 justify-start" />
          </div>
          <button type="button" onClick={share} className={rowClass}>
            <Share2 className="size-5 text-on-surface-variant" aria-hidden />
            مشاركة المنشور
          </button>
          <button
            type="button"
            onClick={() => {
              toast("شكراً لك، تم استلام البلاغ", "info");
              setOpen(false);
            }}
            className={rowClass}
          >
            <Flag className="size-5 text-on-surface-variant" aria-hidden />
            الإبلاغ عن المحتوى
          </button>
        </div>
      </Modal>
    </>
  );
}
