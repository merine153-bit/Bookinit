import { redirect } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { NotificationsButton } from "@/components/layout/notifications-button";
import { canManageRestaurants, getCurrentUser, getOwnedRestaurantId } from "@/lib/auth";
import { getRestaurantById, listNotifications } from "@/lib/data/repository";
import type { Restaurant } from "@/types";
import { DashboardMenuButton, DashboardSidebar } from "./dashboard-nav";

/** يتحقق من الصلاحية ويعيد مطعم صاحب الحساب — تستخدمه كل صفحات لوحة التحكم. */
export async function requireDashboardRestaurant(): Promise<Restaurant> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (!canManageRestaurants(user)) redirect("/profile");

  const restaurantId = await getOwnedRestaurantId(user);
  const restaurant = restaurantId ? await getRestaurantById(restaurantId) : null;
  if (!restaurant) redirect("/profile");

  return restaurant;
}

/** إطار لوحة التحكم: شريط علوي + شريط جانبي على سطح المكتب + تنقل سفلي على الجوال. */
export async function DashboardShell({
  restaurant,
  children,
}: {
  restaurant: Restaurant;
  children: React.ReactNode;
}) {
  const notifications = await listNotifications();

  return (
    <div className="flex min-h-dvh">
      <DashboardSidebar restaurantName={restaurant.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-[100] glass shadow-top border-b border-outline-variant/20">
          <div className="relative flex h-[72px] items-center justify-between px-container-margin">
            <DashboardMenuButton restaurantName={restaurant.name} />
            <div className="absolute inset-x-0 flex justify-center pointer-events-none md:hidden">
              <Brand className="pointer-events-auto" />
            </div>
            <span className="hidden md:block font-display text-label-md text-on-surface truncate">
              {restaurant.name}
            </span>
            <NotificationsButton notifications={notifications} />
          </div>
        </header>

        <main id="main" className="flex-1 pb-28 md:pb-stack-lg">
          {children}
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
}
