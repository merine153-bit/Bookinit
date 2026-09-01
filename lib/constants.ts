import type { RestaurantCategory, SearchFilter } from "@/types";

/** إحداثيات مركز الخريطة الافتراضي — الرياض. */
export const DEFAULT_MAP_CENTER = { latitude: 24.7136, longitude: 46.6753 };
export const DEFAULT_MAP_ZOOM = 12;

export const RESTAURANT_CATEGORIES: RestaurantCategory[] = [
  "مقاهي",
  "مطاعم",
  "حلويات",
  "مخابز",
  "مأكولات بحرية",
  "برغر",
  "بيتزا",
  "قهوة مختصة",
];

export const DISCOVER_FILTERS = ["تصفية", "المطاعم", "المقاهي", "الأعلى تقييماً"] as const;
export type DiscoverFilter = (typeof DISCOVER_FILTERS)[number];

export const SEARCH_FILTERS: SearchFilter[] = [
  "الكل",
  "المطاعم",
  "المقاهي",
  "الأطباق",
  "الأعلى تقييماً",
  "الأقرب إليك",
];

export const MENU_ITEM_TAGS = [
  "نباتي",
  "الأكثر طلباً",
  "جديد",
  "خالٍ من الجلوتين",
  "حار",
  "خيار صحي",
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "الرئيسية", icon: "home" as const },
  { href: "/discover", label: "استكشف", icon: "compass" as const },
  { href: "/saved", label: "المحفوظات", icon: "heart" as const },
  { href: "/profile", label: "حسابي", icon: "user" as const },
];

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "نظرة عامة", icon: "layout" as const },
  { href: "/dashboard/menu", label: "القائمة", icon: "menu" as const },
  { href: "/dashboard/stories", label: "القصص", icon: "story" as const },
  { href: "/dashboard/posts", label: "المنشورات", icon: "post" as const },
  { href: "/dashboard/analytics", label: "التحليلات", icon: "chart" as const },
  { href: "/dashboard/settings", label: "إعدادات المطعم", icon: "settings" as const },
];
