"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Home, User } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = { home: Home, compass: Compass, heart: Heart, user: User };

/** روابط التنقل داخل الشريط العلوي — بديل شريط الجوال السفلي على الشاشات الكبيرة. */
export function DesktopNavigation({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="التنقل الرئيسي" className={cn("hidden md:flex items-center gap-1", className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-label-md transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface",
            )}
          >
            <Icon className="size-5" fill={active ? "currentColor" : "none"} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
