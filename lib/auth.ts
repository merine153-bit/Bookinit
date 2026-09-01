import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEMO_OWNER_ID, demoUsers } from "@/lib/data/demo";
import { DEMO_SESSION_COOKIE } from "@/lib/session";
import type { AppUser } from "@/types";

export { DEMO_SESSION_COOKIE } from "@/lib/session";

/**
 * المستخدم الحالي.
 * مع Supabase: جلسة حقيقية + ملف المستخدم من جدول users.
 * بدون Supabase: جلسة عرض تجريبي محلية مخزّنة في كوكي (للمعاينة فقط).
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();

  if (supabase) {
    const { data } = await supabase.auth.getUser();
    const authUser = data.user;
    if (!authUser) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    return {
      id: authUser.id,
      email: authUser.email ?? "",
      username: profile?.username ?? `@${authUser.email?.split("@")[0] ?? "user"}`,
      fullName: profile?.full_name ?? authUser.user_metadata?.full_name ?? "مستخدم Eatit",
      bio: profile?.bio ?? null,
      avatarUrl: profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
      role: (profile?.role ?? "USER") as AppUser["role"],
      followersCount: profile?.followers_count ?? 0,
      followingCount: profile?.following_count ?? 0,
      createdAt: profile?.created_at ?? authUser.created_at,
    };
  }

  const session = (await cookies()).get(DEMO_SESSION_COOKIE)?.value;
  if (!session) return null;
  return demoUsers.find((u) => u.id === session) ?? null;
}

/** المطعم الذي يملكه المستخدم الحالي (للوحة التحكم). */
export async function getOwnedRestaurantId(user: AppUser | null): Promise<string | null> {
  if (!user) return null;
  const { listRestaurants } = await import("@/lib/data/repository");
  const restaurants = await listRestaurants();
  const owned = restaurants.find((r) => r.ownerId === user.id);
  if (owned) return owned.id;
  // في وضع العرض التجريبي يُربط صاحب الحساب التجريبي بمقهى النور.
  if (user.id === DEMO_OWNER_ID) {
    return restaurants.find((r) => r.ownerId === DEMO_OWNER_ID)?.id ?? null;
  }
  return null;
}

export function canManageRestaurants(user: AppUser | null): boolean {
  return user?.role === "RESTAURANT_OWNER" || user?.role === "ADMIN";
}
