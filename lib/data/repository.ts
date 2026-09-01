import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ActivityEntry,
  AppNotification,
  MenuCategory,
  MenuItem,
  Post,
  PostComment,
  Restaurant,
  Review,
  SearchFilter,
  SearchResult,
  Story,
} from "@/types";
import { demoUserPosts } from "./demo";
import { nextId, staticData, store } from "./store";
import { buildSearchResults } from "@/lib/search";
import {
  fromMenuItem,
  toMenuCategory,
  toMenuItem,
  toOpeningHour,
  toPost,
  toRestaurant,
  toReview,
  toStory,
} from "./mappers";

/**
 * طبقة الوصول للبيانات.
 * تستخدم Supabase عند توفر إعداداتها، وتعود تلقائياً إلى المخزن التجريبي المحلي.
 */

/* -------------------------------------------------------------------------- */
/* المطاعم                                                                     */
/* -------------------------------------------------------------------------- */

export interface RestaurantQuery {
  category?: string;
  minRating?: number;
  sort?: "rating" | "distance" | "newest";
  limit?: number;
}

export async function listRestaurants(query: RestaurantQuery = {}): Promise<Restaurant[]> {
  const supabase = await createClient();

  let results: Restaurant[];
  if (supabase) {
    let request = supabase.from("restaurants").select("*, restaurant_hours(*)");
    if (query.category) request = request.eq("category", query.category);
    if (query.minRating) request = request.gte("rating", query.minRating);
    const { data, error } = await request.limit(query.limit ?? 100);
    if (error) throw new Error(error.message);
    results = (data ?? []).map((row) =>
      toRestaurant(row, (row.restaurant_hours ?? []).map(toOpeningHour)),
    );
  } else {
    results = store.restaurants.filter((r) => {
      if (query.category && r.category !== query.category) return false;
      if (query.minRating && r.rating < query.minRating) return false;
      return true;
    });
  }

  const sorted = [...results];
  if (query.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
  else if (query.sort === "distance") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
  else if (query.sort === "newest") {
    sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  return query.limit ? sorted.slice(0, query.limit) : sorted;
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("restaurants")
      .select("*, restaurant_hours(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return null;
    return toRestaurant(data, (data.restaurant_hours ?? []).map(toOpeningHour));
  }
  return store.restaurants.find((r) => r.slug === slug) ?? null;
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("restaurants")
      .select("*, restaurant_hours(*)")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return toRestaurant(data, (data.restaurant_hours ?? []).map(toOpeningHour));
  }
  return store.restaurants.find((r) => r.id === id) ?? null;
}

/** خريطة مُفهرسة بالمعرّف — تُستعمل لربط المنشورات والقصص بمطاعمها. */
export async function getRestaurantMap(): Promise<Map<string, Restaurant>> {
  const restaurants = await listRestaurants();
  return new Map(restaurants.map((r) => [r.id, r]));
}

export async function updateRestaurant(
  id: string,
  patch: Partial<Restaurant>,
): Promise<Restaurant | null> {
  const supabase = await createClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("restaurants")
      .update({
        name: patch.name,
        description: patch.description,
        short_description: patch.shortDescription,
        logo_url: patch.logoUrl,
        cover_url: patch.coverUrl,
        category: patch.category,
        address: patch.address,
        city: patch.city,
        latitude: patch.latitude,
        longitude: patch.longitude,
        phone: patch.phone,
        tags: patch.tags,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toRestaurant(data) : null;
  }

  const index = store.restaurants.findIndex((r) => r.id === id);
  if (index === -1) return null;
  store.restaurants[index] = { ...store.restaurants[index], ...patch };
  return store.restaurants[index];
}

/* -------------------------------------------------------------------------- */
/* القوائم                                                                     */
/* -------------------------------------------------------------------------- */

export async function listMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order");
    return (data ?? []).map(toMenuCategory);
  }
  return store.menuCategories
    .filter((c) => c.restaurantId === restaurantId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order");
    return (data ?? []).map(toMenuItem);
  }
  return store.menuItems
    .filter((i) => i.restaurantId === restaurantId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listAllMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase.from("menu_items").select("*").order("sort_order");
    return (data ?? []).map(toMenuItem);
  }
  return store.menuItems;
}

export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase.from("menu_items").select("*").eq("id", id).maybeSingle();
    return data ? toMenuItem(data) : null;
  }
  return store.menuItems.find((i) => i.id === id) ?? null;
}

export async function createMenuItem(input: Omit<MenuItem, "id" | "createdAt">): Promise<MenuItem> {
  const supabase = await createClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("menu_items")
      .insert(fromMenuItem(input))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toMenuItem(data);
  }

  const created: MenuItem = { ...input, id: nextId("item"), createdAt: new Date().toISOString() };
  store.menuItems.push(created);
  return created;
}

export async function updateMenuItem(id: string, patch: Partial<MenuItem>): Promise<MenuItem | null> {
  const supabase = await createClient();
  if (supabase) {
    const payload = Object.fromEntries(
      Object.entries(fromMenuItem(patch)).filter(([, v]) => v !== undefined),
    );
    const { data, error } = await supabase
      .from("menu_items")
      .update(payload)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toMenuItem(data) : null;
  }

  const index = store.menuItems.findIndex((i) => i.id === id);
  if (index === -1) return null;
  store.menuItems[index] = { ...store.menuItems[index], ...patch };
  return store.menuItems[index];
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
  const index = store.menuItems.findIndex((i) => i.id === id);
  if (index === -1) return false;
  store.menuItems.splice(index, 1);
  return true;
}

/** يحرّك صنفاً خطوة واحدة لأعلى أو لأسفل داخل قسمه. */
export async function moveMenuItem(id: string, direction: -1 | 1): Promise<boolean> {
  const items = (await listAllMenuItems()).filter((i) => i.categoryId !== undefined);
  const current = items.find((i) => i.id === id);
  if (!current) return false;

  const siblings = items
    .filter((i) => i.categoryId === current.categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const position = siblings.findIndex((i) => i.id === id);
  const target = siblings[position + direction];
  if (!target) return false;

  await updateMenuItem(current.id, { sortOrder: target.sortOrder });
  await updateMenuItem(target.id, { sortOrder: current.sortOrder });
  return true;
}

export async function createMenuCategory(
  restaurantId: string,
  name: string,
): Promise<MenuCategory> {
  const supabase = await createClient();
  const existing = await listMenuCategories(restaurantId);
  const sortOrder = existing.length;

  if (supabase) {
    const { data, error } = await supabase
      .from("menu_categories")
      .insert({ restaurant_id: restaurantId, name, sort_order: sortOrder })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toMenuCategory(data);
  }

  const created: MenuCategory = { id: nextId("cat"), restaurantId, name, sortOrder };
  store.menuCategories.push(created);
  return created;
}

/* -------------------------------------------------------------------------- */
/* المنشورات والتعليقات                                                        */
/* -------------------------------------------------------------------------- */

export async function listPosts(limit?: number): Promise<Post[]> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    return (data ?? []).map(toPost);
  }
  const sorted = [...store.posts].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function listPostsByRestaurant(restaurantId: string): Promise<Post[]> {
  const posts = await listPosts();
  return posts.filter((p) => p.restaurantId === restaurantId);
}

export async function createPost(
  input: Omit<Post, "id" | "createdAt" | "likeCount" | "commentCount">,
): Promise<Post> {
  const supabase = await createClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        restaurant_id: input.restaurantId,
        caption: input.caption,
        image_url: input.imageUrl,
        badge: input.badge,
        badge_tone: input.badgeTone,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toPost(data);
  }

  const created: Post = {
    ...input,
    id: nextId("post"),
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };
  store.posts.unshift(created);
  return created;
}

export async function deletePost(id: string): Promise<boolean> {
  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
  const index = store.posts.findIndex((p) => p.id === id);
  if (index === -1) return false;
  store.posts.splice(index, 1);
  return true;
}

export async function listComments(postId: string): Promise<PostComment[]> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      postId: row.post_id,
      authorName: row.author_name ?? "ضيف",
      authorAvatar: row.author_avatar ?? "",
      body: row.body ?? "",
      createdAt: row.created_at,
    }));
  }
  return staticData.comments.filter((c) => c.postId === postId);
}

/** يجلب تعليقات عدة منشورات دفعة واحدة ويجمّعها حسب المنشور. */
export async function listCommentsForPosts(
  postIds: string[],
): Promise<Record<string, PostComment[]>> {
  const grouped: Record<string, PostComment[]> = {};
  if (postIds.length === 0) return grouped;

  const supabase = await createClient();
  const rows = supabase
    ? ((
        await supabase
          .from("post_comments")
          .select("*")
          .in("post_id", postIds)
          .order("created_at", { ascending: false })
      ).data ?? []
      ).map((row) => ({
        id: row.id,
        postId: row.post_id,
        authorName: row.author_name ?? "ضيف",
        authorAvatar: row.author_avatar ?? "",
        body: row.body ?? "",
        createdAt: row.created_at,
      }))
    : staticData.comments.filter((c) => postIds.includes(c.postId));

  for (const comment of rows) {
    (grouped[comment.postId] ??= []).push(comment);
  }
  return grouped;
}

/* -------------------------------------------------------------------------- */
/* القصص                                                                       */
/* -------------------------------------------------------------------------- */

export async function listStories(): Promise<Story[]> {
  const supabase = await createClient();
  const now = Date.now();
  if (supabase) {
    const { data } = await supabase
      .from("restaurant_stories")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    return (data ?? []).map(toStory);
  }
  return store.stories
    .filter((s) => +new Date(s.expiresAt) > now)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function listStoriesByRestaurant(restaurantId: string): Promise<Story[]> {
  const stories = await listStories();
  return stories.filter((s) => s.restaurantId === restaurantId);
}

export async function getStory(id: string): Promise<Story | null> {
  const stories = await listStories();
  return stories.find((s) => s.id === id) ?? null;
}

export async function createStory(
  input: Omit<Story, "id" | "createdAt" | "expiresAt">,
): Promise<Story> {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 3_600_000).toISOString();
  const supabase = await createClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("restaurant_stories")
      .insert({
        restaurant_id: input.restaurantId,
        title: input.title,
        image_url: input.imageUrl,
        caption: input.caption,
        expires_at: expiresAt,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toStory(data);
  }

  const created: Story = { ...input, id: nextId("story"), createdAt, expiresAt };
  store.stories.unshift(created);
  return created;
}

export async function deleteStory(id: string): Promise<boolean> {
  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("restaurant_stories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  }
  const index = store.stories.findIndex((s) => s.id === id);
  if (index === -1) return false;
  store.stories.splice(index, 1);
  return true;
}

/* -------------------------------------------------------------------------- */
/* التقييمات والإشعارات                                                        */
/* -------------------------------------------------------------------------- */

export async function listReviews(restaurantId?: string): Promise<Review[]> {
  const supabase = await createClient();
  if (supabase) {
    let request = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (restaurantId) request = request.eq("restaurant_id", restaurantId);
    const { data } = await request;
    return (data ?? []).map(toReview);
  }
  const reviews = restaurantId
    ? staticData.reviews.filter((r) => r.restaurantId === restaurantId)
    : staticData.reviews;
  return [...reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function listNotifications(): Promise<AppNotification[]> {
  return staticData.notifications;
}

export async function listActivity(): Promise<ActivityEntry[]> {
  return staticData.activity;
}

/* -------------------------------------------------------------------------- */
/* البحث                                                                       */
/* -------------------------------------------------------------------------- */

export async function searchAll(query: string, filter: SearchFilter = "الكل"): Promise<SearchResult[]> {
  const [restaurants, items] = await Promise.all([listRestaurants(), listAllMenuItems()]);
  return buildSearchResults(query, filter, restaurants, items);
}

/* -------------------------------------------------------------------------- */
/* الملف الشخصي                                                                */
/* -------------------------------------------------------------------------- */

/** منشورات المستخدم — في وضع العرض التجريبي تُعرض مجموعة جاهزة. */
export async function listUserPosts(userId: string): Promise<Post[]> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).map(toPost);
  }
  return demoUserPosts;
}

/** التقييمات التي كتبها المستخدم. */
export async function listUserReviews(authorName: string): Promise<Review[]> {
  const reviews = await listReviews();
  return reviews.filter((review) => review.authorName === authorName);
}
