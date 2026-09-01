"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-container-margin">
      <div className="size-20 rounded-full bg-error-container flex items-center justify-center mb-stack-lg">
        <WifiOff className="size-9 text-on-error-container" aria-hidden />
      </div>
      <h1 className="font-display text-headline-md text-on-surface">حدث خطأ غير متوقع</h1>
      <p className="font-body text-body-md text-on-surface-variant mt-unit max-w-sm">
        تعذّر تحميل هذا الجزء من التطبيق. تحقق من اتصالك ثم أعد المحاولة.
      </p>
      <Button onClick={reset} pill size="lg" className="mt-stack-lg">
        إعادة المحاولة
      </Button>
    </div>
  );
}
