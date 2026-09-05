"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Home, User } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = { home: Home, compass: Compass, heart: Heart, user: User };

/**
 * البوصلة تفقد شكلها تماماً عند ملئها فتصير قرصاً مصمتاً،
 * والتصميم المرجعي يعرضها كخط حتى وهي نشطة.
 */
const FILL_WHEN_ACTIVE = { home: true, compass: false, heart: true, user: true };

/** شريط التنقل السفلي — يظهر على الجوال فقط، بخلفية زجاجية ثابتة أسفل الشاشة. */
export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="md:hidden fixed bottom-0 inset-x-0 z-[90] glass border-t border-outline-variant/30 shadow-nav rounded-t-xl pb-safe"
    >
      <ul className="flex items-stretch justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-all duration-200 active:scale-90",
                  active ? "text-primary" : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                <Icon
                  className={cn("size-6 transition-transform", active && "scale-110")}
                  fill={active && FILL_WHEN_ACTIVE[item.icon] ? "currentColor" : "none"}
                  aria-hidden
                />
                <span className={cn("font-body text-label-sm", active && "font-semibold")}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
