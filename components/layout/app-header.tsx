import Link from "next/link";
import { LayoutDashboard, Search } from "lucide-react";
import { Brand } from "./brand";
import { DesktopNavigation } from "./desktop-navigation";
import { NotificationsButton } from "./notifications-button";
import { listNotifications } from "@/lib/data/repository";
import { canManageRestaurants, getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * الشريط العلوي: بحث (يمين) — شعار Eatit (وسط) — إشعارات (يسار)، كما في التصميم.
 * على الشاشات الكبيرة يتحول إلى شريط تنقل كامل بدل شريط الجوال السفلي.
 */
export async function AppHeader({ className }: { className?: string }) {
  const [notifications, user] = await Promise.all([listNotifications(), getCurrentUser()]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] w-full glass shadow-top border-b border-outline-variant/20",
        className,
      )}
    >
      <div className="relative mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-container-margin">
        {/* الجوال: أيقونة البحث في بداية السطر (اليمين) */}
        <Link
          href="/search"
          aria-label="البحث"
          className="md:hidden size-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high/60 transition-colors active:scale-95"
        >
          <Search className="size-6" aria-hidden />
        </Link>

        {/* سطح المكتب: الشعار ثم روابط التنقل */}
        <div className="hidden md:flex items-center gap-8">
          <Brand />
          <DesktopNavigation />
        </div>

        {/* الجوال: الشعار في المنتصف تماماً */}
        <div className="md:hidden absolute inset-x-0 flex justify-center pointer-events-none">
          <Brand className="pointer-events-auto" />
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="البحث"
            className="hidden md:flex size-10 rounded-full items-center justify-center text-on-surface-variant hover:bg-surface-container-high/60 transition-colors"
          >
            <Search className="size-6" aria-hidden />
          </Link>
          {canManageRestaurants(user) && (
            <Link
              href="/dashboard"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-label-md text-secondary hover:bg-secondary-container/40 transition-colors"
            >
              <LayoutDashboard className="size-5" aria-hidden />
              لوحة التحكم
            </Link>
          )}
          <NotificationsButton notifications={notifications} />
        </div>
      </div>
    </header>
  );
}
