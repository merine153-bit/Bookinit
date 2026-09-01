import { Store } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function RestaurantNotFound() {
  return (
    <AppShell>
      <EmptyState
        icon={Store}
        title="لم نعثر على هذا المطعم"
        description="ربما تغيّر الرابط أو أُزيل المكان من Eatit."
        actionLabel="استكشف أماكن أخرى"
        actionHref="/discover"
      />
    </AppShell>
  );
}
