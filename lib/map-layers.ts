/**
 * طبقات الخريطة المتاحة.
 * معرّفة خارج مكوّنات الخريطة كي يستوردها مبدّل الطبقات وخريطة الاستكشاف
 * وخريطة تحديد الموقع دون أن يسحب أيٌّ منها مكتبة Leaflet.
 */
export type MapLayer = "streets" | "satellite";

export const MAP_LAYERS: Record<MapLayer, { url: string; attribution: string }> = {
  streets: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "صور الأقمار الصناعية &copy; Esri وMaxar وEarthstar Geographics",
  },
};
