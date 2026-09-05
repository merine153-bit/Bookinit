"use client";

import * as React from "react";
import { distanceBetween } from "@/lib/utils";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserPosition extends Coordinates {
  /** دقة القراءة بالأمتار كما يبلّغها الجهاز. */
  accuracy: number;
  timestamp: number;
}

export type LocationStatus =
  | "idle"
  | "unsupported"
  | "locating"
  | "tracking"
  | "denied"
  | "error";

interface LocationValue {
  status: LocationStatus;
  position: UserPosition | null;
  error: string | null;
  /** يبدأ التتبّع المستمر — يستدعيه المستخدم صراحةً. */
  start: () => void;
  stop: () => void;
  /** المسافة الحقيقية بالكيلومترات، أو null إن لم يُعرف الموقع بعد. */
  distanceTo: (target: Coordinates) => number | null;
}

const LocationContext = React.createContext<LocationValue | null>(null);

const STORAGE_KEY = "eatit:location-consent";

function messageFor(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "رُفض الإذن بالوصول إلى الموقع. فعّله من إعدادات المتصفح لهذا الموقع ثم أعد المحاولة.";
    case error.POSITION_UNAVAILABLE:
      return "تعذّر تحديد موقعك — تأكد من تفعيل خدمة الموقع في جهازك.";
    case error.TIMEOUT:
      return "انتهت مهلة تحديد الموقع. جرّب مرة أخرى في مكان أوضح للسماء.";
    default:
      return "تعذّر تحديد موقعك.";
  }
}

/**
 * تتبّع موقع المستخدم عبر أقمار GPS (واجهة Geolocation في المتصفح).
 *
 * الموقع يبقى في جهاز المستخدم ولا يُرسَل إلى الخادم إطلاقاً — يُستخدم
 * لتوسيط الخريطة وحساب المسافات في المتصفح فقط.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<LocationStatus>("idle");
  const [position, setPosition] = React.useState<UserPosition | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const watchIdRef = React.useRef<number | null>(null);

  const stop = React.useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus((current) => (current === "tracking" || current === "locating" ? "idle" : current));
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // التخزين غير متاح — لا يؤثر على إيقاف التتبّع.
    }
  }, []);

  const start = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setError("متصفحك لا يدعم تحديد الموقع.");
      return;
    }
    if (watchIdRef.current !== null) return;

    setError(null);
    setStatus("locating");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (reading) => {
        setPosition({
          latitude: reading.coords.latitude,
          longitude: reading.coords.longitude,
          accuracy: reading.coords.accuracy,
          timestamp: reading.timestamp,
        });
        setStatus("tracking");
        setError(null);
        try {
          window.localStorage.setItem(STORAGE_KEY, "1");
        } catch {
          // تخزين غير متاح — التتبّع يعمل، لكنه لن يُستأنف تلقائياً لاحقاً.
        }
      },
      (positionError) => {
        setStatus(positionError.code === positionError.PERMISSION_DENIED ? "denied" : "error");
        setError(messageFor(positionError));
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 },
    );
  }, []);

  // استئناف التتبّع لمن سبق أن وافق، بلا مطالبة جديدة عند أول زيارة.
  React.useEffect(() => {
    let cancelled = false;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") return;
    } catch {
      return;
    }
    if (!navigator.permissions?.query) {
      start();
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (!cancelled && result.state === "granted") start();
      })
      .catch(() => {
        // بعض المتصفحات لا تدعم الاستعلام — ننتظر طلب المستخدم.
      });
    return () => {
      cancelled = true;
    };
  }, [start]);

  React.useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const value = React.useMemo<LocationValue>(
    () => ({
      status,
      position,
      error,
      start,
      stop,
      distanceTo: (target) => (position ? distanceBetween(position, target) : null),
    }),
    [status, position, error, start, stop],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation(): LocationValue {
  const context = React.useContext(LocationContext);
  if (!context) throw new Error("useUserLocation يجب أن يُستخدم داخل LocationProvider");
  return context;
}

/**
 * المسافة المعروضة: الحقيقية عند توفّر الموقع، وإلا التقديرية المخزّنة.
 * `isLive` تتيح للواجهة تمييز المسافة المحسوبة فعلياً.
 */
export function useDistance(target: Coordinates, fallbackKm: number) {
  const { distanceTo } = useUserLocation();
  const live = distanceTo(target);
  return { km: live ?? fallbackKm, isLive: live !== null };
}
