import type { Coordinates } from "@/hooks/use-location";

/**
 * تخطيط المسار من موقع المستخدم إلى المكان.
 *
 * الخادم الافتراضي هو خادم OSRM التجريبي العام — مناسب للتطوير والعروض،
 * ومحدود للاستخدام الكثيف. لتشغيل إنتاجي جادّ استضِف OSRM أو استخدم مزوّداً
 * مدفوعاً، واضبط NEXT_PUBLIC_ROUTING_URL على عنوانه.
 */
const ROUTING_BASE =
  process.env.NEXT_PUBLIC_ROUTING_URL?.replace(/\/$/, "") ?? "https://router.project-osrm.org";

export interface RouteResult {
  /** نقاط المسار بترتيب [خط العرض، خط الطول] كما يتوقّعها Leaflet. */
  points: Array<[number, number]>;
  distanceKm: number;
  durationMin: number;
}

export class RoutingError extends Error {}

export async function fetchRoute(
  from: Coordinates,
  to: Coordinates,
  signal?: AbortSignal,
): Promise<RouteResult> {
  const url =
    `${ROUTING_BASE}/route/v1/driving/` +
    `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    `?overview=full&geometries=geojson`;

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new RoutingError("تعذّر الاتصال بخدمة تخطيط الطرق — تحقّق من اتصالك.");
  }

  if (!response.ok) {
    throw new RoutingError("خدمة تخطيط الطرق غير متاحة حالياً.");
  }

  const data = (await response.json()) as {
    code?: string;
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: [number, number][] };
    }>;
  };

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new RoutingError("لم نجد طريقاً إلى هذا المكان.");
  }

  const route = data.routes[0];
  return {
    // GeoJSON يعطي [طول، عرض] بينما Leaflet يتوقّع [عرض، طول].
    points: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
    distanceKm: route.distance / 1000,
    durationMin: Math.max(1, Math.round(route.duration / 60)),
  };
}

/** رابط يفتح الاتجاهات في تطبيق الخرائط على الجهاز (للملاحة الصوتية خطوة بخطوة). */
export function externalDirectionsUrl(to: Coordinates, from?: Coordinates | null): string {
  const destination = `${to.latitude},${to.longitude}`;
  const origin = from ? `&origin=${from.latitude},${from.longitude}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}&travelmode=driving`;
}

/** "١٢ دقيقة" — صياغة عربية للمدة. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hoursLabel = hours === 1 ? "ساعة" : hours === 2 ? "ساعتان" : `${hours} ساعات`;
  return rest === 0 ? hoursLabel : `${hoursLabel} و${rest} دقيقة`;
}
