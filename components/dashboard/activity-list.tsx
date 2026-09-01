import Link from "next/link";
import { History, Megaphone, Star, UserPlus, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ActivityEntry } from "@/types";

const ICONS = {
  menu: UtensilsCrossed,
  review: Star,
  story: History,
  follower: UserPlus,
  post: Megaphone,
};

/** قائمة النشاط الأخير في لوحة التحكم. */
export function ActivityList({ items }: { items: ActivityEntry[] }) {
  return (
    <Card>
      <ul className="divide-y divide-outline-variant/30">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={item.id} className="p-stack-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="size-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-on-surface-variant" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-body text-label-md text-on-surface truncate">{item.title}</p>
                  <p className="font-body text-label-sm text-on-surface-variant">{item.timeAgo}</p>
                </div>
              </div>
              <Link
                href={item.href}
                className="shrink-0 font-body text-label-sm text-primary hover:underline"
              >
                عرض
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
