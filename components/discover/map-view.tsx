"use client";

import * as React from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import type { Restaurant } from "@/types";
import { createRestaurantIcon } from "./map-marker";

interface MapViewProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

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

/** خريطة تفاعلية حقيقية (Leaflet + OpenStreetMap) بعلامات بهوية Eatit. */
export default function MapView({ restaurants, selectedId, onSelect }: MapViewProps) {
  const selected = restaurants.find((r) => r.id === selectedId);

  return (
    <MapContainer
      center={[DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude]}
      zoom={DEFAULT_MAP_ZOOM}
      scrollWheelZoom
      zoomControl={false}
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitToResults restaurants={restaurants} />
      <FlyToSelected restaurant={selected} />
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
