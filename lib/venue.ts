import type { Restaurant } from "@/types";

/** التصنيف الثنائي الذي يراه المستخدم: مقهى أم مطعم. */
export type VenueType = "مقهى" | "مطعم";

/**
 * الفئات التي تُعامل كمقاهٍ في التصنيف والتصفية وعلامات الخريطة.
 * مصدر واحد للحقيقة حتى لا تتناقض شارة النوع مع نتائج تبويب "المقاهي".
 */
export const CAFE_CATEGORIES = new Set(["مقاهي", "قهوة مختصة", "مخابز", "حلويات"]);

export function venueTypeOf(category: string): VenueType {
  return CAFE_CATEGORIES.has(category) ? "مقهى" : "مطعم";
}

export function isCafe(restaurant: Pick<Restaurant, "category">): boolean {
  return CAFE_CATEGORIES.has(restaurant.category);
}
