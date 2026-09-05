"use client";

import { MapPin } from "lucide-react";
import { useDistance } from "@/hooks/use-location";
import { cn, formatDistance } from "@/lib/utils";

/**
 * المسافة إلى المكان: محسوبة من موقع المستخدم الفعلي عند توفّره،
 * وإلا التقديرية المخزّنة. مكوّن عميل مستقل حتى تبقى البطاقات المحيطة
 * قابلة للتصيير على الخادم.
 */
export function LiveDistance({
  latitude,
  longitude,
  fallbackKm,
  withIcon = true,
  className,
  iconClassName,
}: {
  latitude: number;
  longitude: number;
  fallbackKm: number;
  withIcon?: boolean;
  className?: string;
  iconClassName?: string;
}) {
  const { km, isLive } = useDistance({ latitude, longitude }, fallbackKm);

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      title={isLive ? "مسافة محسوبة من موقعك الحالي" : "مسافة تقديرية — فعّل تحديد الموقع لدقة أعلى"}
    >
      {withIcon && <MapPin className={cn("size-3.5", iconClassName)} aria-hidden />}
      <span className="numeric">{formatDistance(km)}</span>
      {isLive && <span className="sr-only">من موقعك الحالي</span>}
    </span>
  );
}
