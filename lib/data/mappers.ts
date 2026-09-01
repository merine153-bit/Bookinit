import type {
  MenuCategory,
  MenuItem,
  OpeningHour,
  Post,
  Restaurant,
  RestaurantCategory,
  Review,
  Story,
} from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** محوّلات صفوف قاعدة البيانات (snake_case) إلى أنواع التطبيق (camelCase). */

export function toRestaurant(row: any, hours: OpeningHour[] = []): Restaurant {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    shortDescription: row.short_description ?? "",
    logoUrl: row.logo_url ?? "",
    coverUrl: row.cover_url ?? "",
    category: (row.category ?? "مطاعم") as RestaurantCategory,
    tags: row.tags ?? [],
    address: row.address ?? "",
    city: row.city ?? "",
    latitude: Number(row.latitude ?? 0),
    longitude: Number(row.longitude ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    followerCount: row.follower_count ?? 0,
    likeCount: row.like_count ?? 0,
    priceRange: (row.price_range ?? 2) as 1 | 2 | 3,
    isVerified: Boolean(row.is_verified),
    phone: row.phone ?? null,
    distanceKm: Number(row.distance_km ?? 0),
    hours,
    createdAt: row.created_at,
  };
}

export function toOpeningHour(row: any): OpeningHour {
  return {
    dayOfWeek: row.day_of_week,
    opensAt: row.opens_at ?? "00:00",
    closesAt: row.closes_at ?? "00:00",
    isClosed: Boolean(row.is_closed),
  };
}

export function toMenuCategory(row: any): MenuCategory {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
  };
}

export function toMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price ?? 0),
    currency: row.currency ?? "ر.س",
    imageUrl: row.image_url ?? "",
    isAvailable: row.is_available ?? true,
    tags: row.tags ?? [],
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

export function fromMenuItem(item: Partial<MenuItem>) {
  return {
    category_id: item.categoryId,
    restaurant_id: item.restaurantId,
    name: item.name,
    description: item.description,
    price: item.price,
    currency: item.currency,
    image_url: item.imageUrl,
    is_available: item.isAvailable,
    tags: item.tags,
    sort_order: item.sortOrder,
  };
}

export function toPost(row: any): Post {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    caption: row.caption ?? "",
    imageUrl: row.image_url ?? "",
    badge: row.badge ?? null,
    badgeTone: (row.badge_tone ?? "new") as Post["badgeTone"],
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    createdAt: row.created_at,
  };
}

export function toStory(row: any): Story {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    title: row.title ?? "",
    imageUrl: row.image_url ?? "",
    caption: row.caption ?? "",
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export function toReview(row: any): Review {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    authorName: row.author_name ?? "ضيف",
    authorAvatar: row.author_avatar ?? "",
    rating: Number(row.rating ?? 0),
    comment: row.comment ?? "",
    createdAt: row.created_at,
  };
}
