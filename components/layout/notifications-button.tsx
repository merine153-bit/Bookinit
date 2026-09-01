"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { timeAgo } from "@/lib/utils";
import type { AppNotification } from "@/types";

/** جرس الإشعارات مع نقطة "غير مقروء" ولوحة تعرض آخر التنبيهات. */
export function NotificationsButton({ notifications }: { notifications: AppNotification[] }) {
  const [open, setOpen] = React.useState(false);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={unread ? `الإشعارات، ${unread} غير مقروءة` : "الإشعارات"}
        className="relative size-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high/60 transition-colors active:scale-95"
      >
        <Bell className="size-6" aria-hidden />
        {unread > 0 && (
          <span className="absolute top-1.5 end-1.5 size-2.5 rounded-full bg-primary ring-2 ring-surface" />
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="الإشعارات" variant="drawer">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center text-center py-8">
            <BellOff className="size-10 text-on-surface-variant mb-stack-md" aria-hidden />
            <p className="font-body text-body-md text-on-surface-variant">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant/20">
            {notifications.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col gap-1 py-4 group"
                >
                  <span className="flex items-center gap-2">
                    {!item.isRead && <span className="size-2 rounded-full bg-primary" aria-hidden />}
                    <span className="font-body text-label-md text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                  </span>
                  <span className="font-body text-body-md text-on-surface-variant">{item.body}</span>
                  <span className="font-body text-label-sm text-on-surface-variant/80">
                    {timeAgo(item.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}
