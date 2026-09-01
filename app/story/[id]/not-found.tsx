import { Clock } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function StoryNotFound() {
  return (
    <AppShell>
      <EmptyState
        icon={Clock}
        title="انتهت صلاحية هذه القصة"
        description="القصص تبقى متاحة لمدة 24 ساعة فقط."
        actionLabel="عد إلى الرئيسية"
        actionHref="/"
      />
    </AppShell>
  );
}
