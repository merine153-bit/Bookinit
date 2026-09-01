"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Clapperboard,
  LayoutDashboard,
  Megaphone,
  Menu as MenuIcon,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = {
  layout: LayoutDashboard,
  menu: UtensilsCrossed,
  story: Clapperboard,
  post: Megaphone,
  chart: BarChart3,
  settings: Settings,
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-body text-label-md transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** الشريط الجانبي الثابت للوحة التحكم على الشاشات الكبيرة. */
export function DashboardSidebar({ restaurantName }: { restaurantName: string }) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-stack-lg border-s border-outline-variant/30 bg-surface px-gutter py-stack-lg sticky top-0 h-dvh">
      <div>
        <p className="font-body text-label-sm text-on-surface-variant">لوحة تحكم</p>
        <p className="font-display text-label-md text-on-surface truncate">{restaurantName}</p>
      </div>
      <nav aria-label="أقسام لوحة التحكم">
        <NavLinks />
      </nav>
      <Link
        href="/"
        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-lg font-body text-label-md text-secondary hover:bg-secondary-container/40 transition-colors"
      >
        العودة إلى التطبيق ←
      </Link>
    </aside>
  );
}

/** زر القائمة على الجوال — يفتح درج التنقل داخل لوحة التحكم. */
export function DashboardMenuButton({ restaurantName }: { restaurantName: string }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح قائمة لوحة التحكم"
        aria-expanded={open}
        className="md:hidden size-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high/60 transition-colors"
      >
        <MenuIcon className="size-6" aria-hidden />
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-[130]">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-surface shadow-level-2 p-gutter flex flex-col gap-stack-lg animate-[fade-up_200ms_ease-out]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-body text-label-sm text-on-surface-variant">لوحة تحكم</p>
                <p className="font-display text-label-md text-on-surface truncate">{restaurantName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="size-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <nav aria-label="أقسام لوحة التحكم">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="mt-auto px-4 py-3 rounded-lg font-body text-label-md text-secondary hover:bg-secondary-container/40 transition-colors"
            >
              العودة إلى التطبيق ←
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
