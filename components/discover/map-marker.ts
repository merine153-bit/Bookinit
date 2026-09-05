import L from "leaflet";
import type { Restaurant } from "@/types";
import { isCafe as isCafeVenue } from "@/lib/venue";

const UTENSILS_PATH =
  '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>';
const COFFEE_PATH =
  '<path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>';

const svg = (path: string, size: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

/**
 * علامة الخريطة بهوية Eatit:
 * دائرة حمراء بأيقونة شوكة وسكين للمطاعم، ومستطيل أخضر غابي بأيقونة فنجان للمقاهي.
 * العلامة النشطة أكبر وتحمل اسم المكان أسفلها.
 */
export function createRestaurantIcon(restaurant: Restaurant, active: boolean): L.DivIcon {
  const isCafe = isCafeVenue(restaurant);
  const size = active ? 56 : 40;
  const iconSize = active ? 28 : 22;
  const shape = isCafe ? "border-radius:14px;background:#2e6767;" : "border-radius:9999px;background:#b3290f;";

  const label = active
    ? `<span style="margin-top:6px;background:#fcf9f8;color:#1b1c1c;font-size:12px;line-height:16px;font-weight:500;padding:4px 10px;border-radius:6px;box-shadow:0 4px 20px rgba(0,0,0,.12);white-space:nowrap;">${restaurant.name}</span>`
    : "";

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);">
      <span style="${shape}width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:all .2s;">
        ${svg(isCafe ? COFFEE_PATH : UTENSILS_PATH, iconSize)}
      </span>
      ${label}
    </div>`;

  return L.divIcon({
    className: "eatit-marker",
    html,
    iconSize: [size, size],
    iconAnchor: [0, 0],
  });
}
