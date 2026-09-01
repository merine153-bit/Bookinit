import type { MenuCategory, MenuItem, Post, Restaurant, Story } from "@/types";
import {
  demoActivity,
  demoComments,
  demoMenuCategories,
  demoMenuItems,
  demoNotifications,
  demoPosts,
  demoRestaurants,
  demoReviews,
  demoStories,
  demoUsers,
} from "./demo";

/**
 * مخزن قابل للتعديل يُستخدم في "وضع العرض التجريبي" (بدون Supabase).
 * يبقى في ذاكرة الخادم طوال عمر العملية، فتعمل عمليات الإضافة والتعديل والحذف فعلياً.
 */
type MutableStore = {
  restaurants: Restaurant[];
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
  posts: Post[];
  stories: Story[];
};

const globalRef = globalThis as unknown as { __eatitStore?: MutableStore };

function createStore(): MutableStore {
  return {
    restaurants: demoRestaurants.map((r) => ({ ...r })),
    menuCategories: demoMenuCategories.map((c) => ({ ...c })),
    menuItems: demoMenuItems.map((i) => ({ ...i })),
    posts: demoPosts.map((p) => ({ ...p })),
    stories: demoStories.map((s) => ({ ...s })),
  };
}

export const store: MutableStore = (globalRef.__eatitStore ??= createStore());

/** بيانات ثابتة لا تُعدَّل من واجهة التطبيق. */
export const staticData = {
  users: demoUsers,
  reviews: demoReviews,
  comments: demoComments,
  notifications: demoNotifications,
  activity: demoActivity,
};

export function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
