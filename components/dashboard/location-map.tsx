"use client";

import * as React from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_LAYERS, type MapLayer } from "@/lib/map-layers";
import type { Coordinates } from "@/hooks/use-location";
import { createPinIcon } from "./location-pin";

interface LocationMapProps {
  value: Coordinates;
  onChange: (next: Coordinates) => void;
  layer: MapLayer;
  /** يتغيّر عند الضغط على «موقعي الحالي» ليقفز بالخريطة إلى الإحداثيات الجديدة. */
  flyKey: number;
}

/** يلتقط النقر على الخريطة لوضع العلامة في المكان المطلوب. */
function ClickToPlace({ onChange }: { onChange: (next: Coordinates) => void }) {
  useMapEvents({
    click: (event) => onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
  });
  return null;
}

/** يقفز بالخريطة عند تغيّر الإحداثيات من خارجها (زر الموقع أو الحقول الرقمية). */
function FlyToValue({ value, flyKey }: { value: Coordinates; flyKey: number }) {
  const map = useMap();
  React.useEffect(() => {
    if (flyKey === 0) return;
    map.flyTo([value.latitude, value.longitude], Math.max(map.getZoom(), 17), { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyKey]);
  return null;
}

/**
 * خريطة تحديد موقع المكان في لوحة التحكم.
 * صاحب المطعم ينقر أو يسحب العلامة بدل كتابة الإحداثيات يدوياً،
 * وطبقة الأقمار الصناعية تساعده على التعرّف على المبنى نفسه.
 */
export default function LocationMap({ value, onChange, layer, flyKey }: LocationMapProps) {
  const tiles = MAP_LAYERS[layer];

  return (
    <MapContainer
      center={[value.latitude, value.longitude]}
      zoom={16}
      scrollWheelZoom
      zoomControl={false}
      className="size-full"
    >
      <TileLayer key={layer} url={tiles.url} attribution={tiles.attribution} maxZoom={19} />
      <ClickToPlace onChange={onChange} />
      <FlyToValue value={value} flyKey={flyKey} />
      <Marker
        position={[value.latitude, value.longitude]}
        icon={createPinIcon()}
        draggable
        autoPan
        alt="موقع المكان"
        eventHandlers={{
          dragend: (event) => {
            const { lat, lng } = event.target.getLatLng();
            onChange({ latitude: lat, longitude: lng });
          },
        }}
      />
    </MapContainer>
  );
}
