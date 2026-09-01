import { AppHeader } from "./app-header";
import { BottomNavigation } from "./bottom-navigation";
import { cn } from "@/lib/utils";

/** الإطار العام لصفحات التطبيق العامة (خارج لوحة التحكم). */
export function AppShell({
  children,
  className,
  /** الصفحات التي تملأ الشاشة (مثل الخريطة) لا تحتاج حشوة سفلية إضافية. */
  fullBleed = false,
}: {
  children: React.ReactNode;
  className?: string;
  fullBleed?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main
        id="main"
        className={cn("flex-1", fullBleed ? "" : "pb-28 md:pb-16", className)}
      >
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
