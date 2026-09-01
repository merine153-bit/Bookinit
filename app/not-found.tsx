import { Compass } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <AppShell>
      <EmptyState
        icon={Compass}
        title="لم نعثر على هذه الصفحة"
        description="الرابط الذي فتحته غير موجود أو تم نقله. جرّب العودة إلى الرئيسية."
        actionLabel="العودة إلى الرئيسية"
        actionHref="/"
      />
    </AppShell>
  );
}
