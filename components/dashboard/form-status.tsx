"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionResult } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";

/** زر إرسال يعرض حالة الانتظار تلقائياً. */
export function SubmitButton({
  children,
  pendingLabel = "جارٍ الحفظ…",
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

/** رسالة نتيجة العملية (نجاح/خطأ) أسفل النموذج. */
export function FormMessage({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p
      role="status"
      className={cn(
        "rounded-lg px-4 py-3 font-body text-label-md",
        state.ok
          ? "bg-secondary-container/50 text-on-secondary-container"
          : "bg-error-container text-on-error-container",
      )}
    >
      {state.message}
    </p>
  );
}
