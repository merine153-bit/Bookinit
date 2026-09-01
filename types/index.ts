/** أنواع البيانات الأساسية لمنصة Eatit — تعكس مخطط قاعدة البيانات في supabase/migrations. */

export type UserRole = "USER" | "RESTAURANT_OWNER" | "ADMIN";

export interface AppUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export type RestaurantCategory =
  | "مقاهي"
  | "مطاعم"
  | "حلويات"
  | "مخابز"
  | "مأكولات بحرية"
  | "برغر"
  | "بيتزا"
  | "قهوة مختصة";

export interface OpeningHour {
  /** 0 = الأحد … 6 = السبت */
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  logoUrl: string;
  coverUrl: string;
  category: RestaurantCategory;
  tags: string[];
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  followerCount: number;
  likeCount: number;
  priceRange: 1 | 2 | 3;
  isVerified: boolean;
  phone: string | null;
  /** المسافة التقريبية من موقع المستخدم بالكيلومتر (تُحسب عند العرض). */
  distanceKm: number;
  hours: OpeningHour[];
  createdAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  isAvailable: boolean;
  tags: string[];
  sortOrder: number;
  createdAt: string;
}

export interface Post {
  id: string;
  restaurantId: string;
  caption: string;
  imageUrl: string;
  badge: string | null;
  badgeTone: "new" | "popular";
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
}

export interface Story {
  id: string;
  restaurantId: string;
  title: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  expiresAt: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type SavedEntityType = "restaurant" | "menu_item" | "post";

export interface SavedItem {
  id: string;
  userId: string;
  entityType: SavedEntityType;
  entityId: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  href: string;
}

export interface ActivityEntry {
  id: string;
  icon: "menu" | "review" | "story" | "follower" | "post";
  title: string;
  timeAgo: string;
  href: string;
}

/** نتيجة موحّدة للبحث الشامل. */
export type SearchResult =
  | { kind: "restaurant"; restaurant: Restaurant }
  | { kind: "dish"; item: MenuItem; restaurant: Restaurant };

export type SearchFilter =
  | "الكل"
  | "المطاعم"
  | "المقاهي"
  | "الأطباق"
  | "الأعلى تقييماً"
  | "الأقرب إليك";
