import { DashboardShell, requireDashboardRestaurant } from "@/components/dashboard/dashboard-shell";

export const metadata = {
  title: "لوحة التحكم",
  description: "إدارة ملف المطعم والقائمة والقصص والتحليلات.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const restaurant = await requireDashboardRestaurant();
  return <DashboardShell restaurant={restaurant}>{children}</DashboardShell>;
}
