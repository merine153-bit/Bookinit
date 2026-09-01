import { normalizeArabic } from "@/lib/utils";
import type { MenuItem, Restaurant, SearchFilter, SearchResult } from "@/types";

/** فئات تُعامل كـ"مقاهي" في التصفية. */
export const CAFE_CATEGORIES = new Set(["مقاهي", "قهوة مختصة", "مخابز", "حلويات"]);

/** منطق البحث مشترك بين الخادم والعميل حتى تتطابق النتائج. */
export function buildSearchResults(
  query: string,
  filter: SearchFilter,
  restaurants: Restaurant[],
  items: MenuItem[],
): SearchResult[] {
  const q = normalizeArabic(query);
  const byId = new Map(restaurants.map((r) => [r.id, r]));

  const matchRestaurant = (r: Restaurant) =>
    !q ||
    normalizeArabic(r.name).includes(q) ||
    normalizeArabic(r.category).includes(q) ||
    normalizeArabic(r.city).includes(q) ||
    normalizeArabic(r.address).includes(q) ||
    r.tags.some((t) => normalizeArabic(t).includes(q));

  const matchItem = (i: MenuItem) =>
    !q ||
    normalizeArabic(i.name).includes(q) ||
    normalizeArabic(i.description).includes(q) ||
    i.tags.some((t) => normalizeArabic(t).includes(q));

  let restaurantResults: SearchResult[] = restaurants
    .filter(matchRestaurant)
    .map((restaurant) => ({ kind: "restaurant" as const, restaurant }));

  let dishResults: SearchResult[] = items
    .filter(matchItem)
    .map((item) => {
      const restaurant = byId.get(item.restaurantId);
      return restaurant ? { kind: "dish" as const, item, restaurant } : null;
    })
    .filter((r): r is Extract<SearchResult, { kind: "dish" }> => r !== null);

  switch (filter) {
    case "المطاعم":
      restaurantResults = restaurantResults.filter(
        (r) => r.kind === "restaurant" && !CAFE_CATEGORIES.has(r.restaurant.category),
      );
      dishResults = [];
      break;
    case "المقاهي":
      restaurantResults = restaurantResults.filter(
        (r) => r.kind === "restaurant" && CAFE_CATEGORIES.has(r.restaurant.category),
      );
      dishResults = [];
      break;
    case "الأطباق":
      restaurantResults = [];
      break;
    case "الأعلى تقييماً":
      restaurantResults = restaurantResults
        .filter((r) => r.kind === "restaurant" && r.restaurant.rating >= 4.5)
        .sort((a, b) =>
          a.kind === "restaurant" && b.kind === "restaurant"
            ? b.restaurant.rating - a.restaurant.rating
            : 0,
        );
      dishResults = [];
      break;
    case "الأقرب إليك":
      restaurantResults = restaurantResults.sort((a, b) =>
        a.kind === "restaurant" && b.kind === "restaurant"
          ? a.restaurant.distanceKm - b.restaurant.distanceKm
          : 0,
      );
      dishResults = [];
      break;
    default:
      break;
  }

  return [...restaurantResults, ...dishResults];
}
