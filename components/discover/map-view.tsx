"use client";

import * as React from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import type { UserPosition } from "@/hooks/use-location";
import type { Restaurant } from "@/types";
import { createRestaurantIcon, createUserLocationIcon } from "./map-marker";

interface MapViewProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userPosition: UserPosition | null;
  /** يتغيّر عند ضغط المستخدم على "موقعي" ليعيد توسيط الخريطة عليه. */
  recenterKey: number;
  layer: MapLayer;
}

export type MapLayer = "streets" | "satellite";

const LAYERS: Record<MapLayer, { url: string; attribution: string }> = {
  streets: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "صور الأقمار الصناعية &copy; Esri وMaxar وEarthstar Geographics",
  },
};

/** يحرّك الخريطة نحو المطعم المختار. */
function FlyToSelected({ restaurant }: { restaurant: Restaurant | undefined }) {
  const map = useMap();
  React.useEffect(() => {
    if (!restaurant) return;
    map.flyTo([restaurant.latitude, restaurant.longitude], Math.max(map.getZoom(), 14), {
      duration: 0.7,
    });
  }, [restaurant, map]);
  return null;
}

/** يعيد ضبط حدود الخريطة لتشمل كل النتائج بعد تغيير التصفية. */
function FitToResults({ restaurants }: { restaurants: Restaurant[] }) {
  const map = useMap();
  const signature = restaurants.map((r) => r.id).join(",");

  React.useEffect(() => {
    if (restaurants.length === 0) return;
    const bounds = restaurants.map((r) => [r.latitude, r.longitude] as [number, number]);
    map.fitBounds(bounds, { padding: [64, 64], maxZoom: 14, animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return null;
}

/** يوسّط الخريطة على موقع المستخدم عند أول قراءة وعند كل طلب "موقعي". */
function FollowUser({
  position,
  recenterKey,
}: {
  position: UserPosition | null;
  recenterKey: number;
}) {
  const map = useMap();
  const centredOnce = React.useRef(false);

  React.useEffect(() => {
    if (!position) return;
    const isFirstFix = !centredOnce.current;
    if (!isFirstFix && recenterKey === 0) return;
    centredOnce.current = true;
    map.flyTo([position.latitude, position.longitude], Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.latitude, position?.longitude, recenterKey]);

  return null;
}

/** خريطة تفاعلية حقيقية (Leaflet) بعلامات بهوية Eatit وطبقتَي خريطة وأقمار صناعية. */
export default function MapView({
  restaurants,
  selectedId,
  onSelect,
  userPosition,
  recenterKey,
  layer,
}: MapViewProps) {
  const selected = restaurants.find((r) => r.id === selectedId);
  const tiles = LAYERS[layer];

  return (
    <MapContainer
      center={[DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude]}
      zoom={DEFAULT_MAP_ZOOM}
      scrollWheelZoom
      zoomControl={false}
      className="size-full"
    >
      {/* المفتاح يجبر Leaflet على استبدال الطبقة بدل مزجها عند التبديل. */}
      <TileLayer key={layer} url={tiles.url} attribution={tiles.attribution} maxZoom={19} />

      <FitToResults restaurants={restaurants} />
      <FlyToSelected restaurant={selected} />
      <FollowUser position={userPosition} recenterKey={recenterKey} />

      {userPosition && (
        <>
          {/* دائرة الدقة: تُظهر هامش الخطأ الذي يبلّغه الجهاز بدل ادّعاء دقة مطلقة. */}
          <Circle
            center={[userPosition.latitude, userPosition.longitude]}
            radius={userPosition.accuracy}
            pathOptions={{
              color: "#1a73e8",
              weight: 1,
              opacity: 0.5,
              fillColor: "#1a73e8",
              fillOpacity: 0.12,
            }}
          />
          <Marker
            position={[userPosition.latitude, userPosition.longitude]}
            icon={createUserLocationIcon()}
            interactive={false}
            zIndexOffset={2000}
            alt="موقعك الحالي"
          />
        </>
      )}

      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={[restaurant.latitude, restaurant.longitude]}
          icon={createRestaurantIcon(restaurant, restaurant.id === selectedId)}
          zIndexOffset={restaurant.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(restaurant.id) }}
          alt={restaurant.name}
          keyboard
        />
      ))}
    </MapContainer>
  );
}
