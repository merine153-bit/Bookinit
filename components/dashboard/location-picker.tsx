"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Crosshair, Loader2, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/field";
import { LayerSwitcher } from "@/components/discover/layer-switcher";
import { useUserLocation, type Coordinates } from "@/hooks/use-location";
import type { MapLayer } from "@/lib/map-layers";
import { cn } from "@/lib/utils";

/** الخريطة تعمل في المتصفح فقط (Leaflet يحتاج إلى window). */
const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

/** ست خانات عشرية ≈ دقة عشرة سنتيمترات: أكثر مما يحتاجه أي مبنى. */
const round = (value: number) => Number(value.toFixed(6));

/**
 * تحديد موقع المكان على الخريطة.
 *
 * صاحب المطعم ينقر على موقعه أو يسحب الدبّوس إليه، أو يلتقطه من جهازه
 * وهو واقف في المحل. الحقول الرقمية تبقى ظاهرة لمن يعرف إحداثياته بالضبط
 * ولمستخدمي قارئات الشاشة الذين لا تصلح لهم الخريطة وحدها.
 */
export function LocationPicker({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  /** يُعرض فوق الخريطة ليطابق صاحب المطعم بين عنوانه والدبّوس. */
  address?: string;
}) {
  const [value, setValue] = React.useState<Coordinates>({ latitude, longitude });
  const [draft, setDraft] = React.useState({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const [layer, setLayer] = React.useState<MapLayer>("satellite");
  const [flyKey, setFlyKey] = React.useState(0);
  // خطأ الموقع مشترك مع بقية التطبيق؛ لا نعرضه هنا إلا لمن طلب موقعه من هذه الشاشة.
  const [requestedLocation, setRequestedLocation] = React.useState(false);

  const { position, status, error, start } = useUserLocation();
  const locating = status === "locating";
  const blocked = status === "denied" || status === "unsupported";

  // بعد موافقة صاحب المطعم على تحديد الموقع، أول قراءة تنقل الدبّوس إليه.
  const awaitingFix = React.useRef(false);
  React.useEffect(() => {
    if (!awaitingFix.current || !position) return;
    awaitingFix.current = false;
    moveTo({ latitude: position.latitude, longitude: position.longitude });
  }, [position]);

  function moveTo(next: Coordinates) {
    const rounded = { latitude: round(next.latitude), longitude: round(next.longitude) };
    setValue(rounded);
    setDraft({ latitude: String(rounded.latitude), longitude: String(rounded.longitude) });
    setFlyKey((key) => key + 1);
  }

  function useMyLocation() {
    if (position) {
      moveTo({ latitude: position.latitude, longitude: position.longitude });
      return;
    }
    awaitingFix.current = true;
    setRequestedLocation(true);
    start();
  }

  /**
   * الحقول الرقمية تحتفظ بنصّها الخام أثناء الكتابة، فلا تُبعثَر الخريطة
   * على كل ضغطة مفتاح ولا يمنع الحقلُ المتحكَّم فيه مسحَ ما فيه وإعادة كتابته.
   */
  function commitField(axis: keyof Coordinates, raw: string) {
    const parsed = Number(raw);
    const limit = axis === "latitude" ? 90 : 180;
    if (raw.trim() === "" || Number.isNaN(parsed) || Math.abs(parsed) > limit) {
      setDraft((current) => ({ ...current, [axis]: String(value[axis]) }));
      return;
    }
    moveTo({ ...value, [axis]: parsed });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-body text-label-md text-on-surface">موقع المكان على الخريطة</span>
        <span className="font-body text-label-sm text-on-surface-variant">
          انقر على الخريطة أو اسحب الدبّوس إلى مدخل المكان.
        </span>
      </div>

      <input type="hidden" name="latitude" value={value.latitude} />
      <input type="hidden" name="longitude" value={value.longitude} />

      <div className="relative h-80 overflow-hidden rounded-xl border border-outline-variant/40 isolate">
        <LocationMap value={value} onChange={moveTo} layer={layer} flyKey={flyKey} />

        <LayerSwitcher
          value={layer}
          onChange={setLayer}
          className="absolute top-3 start-3 z-[1000]"
        />

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating || blocked}
          title={blocked ? "تحديد الموقع غير متاح في هذا المتصفح" : "ضع الدبّوس على موقعي الحالي"}
          className={cn(
            "absolute bottom-3 end-3 z-[1000] inline-flex items-center gap-2 rounded-full",
            "bg-surface-container-lowest px-4 py-3 font-body text-label-sm text-on-surface",
            "shadow-level-2 transition-all active:scale-95 hover:text-primary",
            "disabled:opacity-60 disabled:pointer-events-none",
          )}
        >
          {locating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Crosshair className="size-4" aria-hidden />
          )}
          {locating ? "جارٍ تحديد موقعك…" : "استخدم موقعي الحالي"}
        </button>

        {address && (
          <div className="absolute top-3 end-3 z-[1000] max-w-[55%] rounded-full glass px-3 py-2 shadow-level-1">
            <p className="flex items-center gap-1.5 font-body text-label-sm text-on-surface truncate">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
              <bdi className="truncate">{address}</bdi>
            </p>
          </div>
        )}
      </div>

      {requestedLocation && error && (
        <p role="alert" className="font-body text-label-sm text-error">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-gutter">
        <div className="flex flex-col gap-2">
          <label htmlFor="latitude-field" className="font-body text-label-sm text-on-surface-variant">
            خط العرض
          </label>
          <Input
            id="latitude-field"
            type="number"
            step="0.000001"
            min={-90}
            max={90}
            dir="ltr"
            value={draft.latitude}
            onChange={(event) => setDraft({ ...draft, latitude: event.target.value })}
            onBlur={(event) => commitField("latitude", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="longitude-field"
            className="font-body text-label-sm text-on-surface-variant"
          >
            خط الطول
          </label>
          <Input
            id="longitude-field"
            type="number"
            step="0.000001"
            min={-180}
            max={180}
            dir="ltr"
            value={draft.longitude}
            onChange={(event) => setDraft({ ...draft, longitude: event.target.value })}
            onBlur={(event) => commitField("longitude", event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
