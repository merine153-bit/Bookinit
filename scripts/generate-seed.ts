/**
 * يولّد supabase/seed.sql من بيانات العرض في lib/data/demo.ts
 * حتى تبقى قاعدة البيانات والبيانات التجريبية متطابقتين.
 *
 * التشغيل:  npm run seed:generate
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  demoActivity,
  demoComments,
  demoMenuCategories,
  demoMenuItems,
  demoPosts,
  demoRestaurants,
  demoReviews,
  demoStories,
  demoUserPosts,
} from "../lib/data/demo";

void demoActivity;

/** معرّف UUID ثابت مشتق من معرّف نصي — يجعل التوليد قابلاً للتكرار. */
function uuidFrom(value: string): string {
  const h = createHash("md5").update(`eatit:${value}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const q = (value: string | null | undefined) =>
  value === null || value === undefined ? "null" : `'${value.replace(/'/g, "''")}'`;

const arr = (values: string[]) =>
  values.length === 0 ? "'{}'" : `array[${values.map(q).join(", ")}]::text[]`;

const ts = (value: string) => `'${new Date(value).toISOString()}'::timestamptz`;

const lines: string[] = [
  "-- =====================================================================",
  "-- Eatit — بيانات تجريبية عربية واقعية",
  "-- مولّد آلياً من lib/data/demo.ts عبر: npm run seed:generate",
  "-- =====================================================================",
  "",
  "begin;",
  "",
  "-- تفريغ البيانات التجريبية السابقة",
  "truncate table public.post_comments, public.post_likes, public.posts,",
  "  public.restaurant_stories, public.reviews, public.menu_items,",
  "  public.menu_categories, public.restaurant_hours, public.restaurant_followers,",
  "  public.restaurants restart identity cascade;",
  "",
  "-- ملاحظة: owner_id يُترك فارغاً هنا. بعد إنشاء حساب صاحب المطعم عبر",
  "-- Supabase Auth، اربطه بمطعمه:",
  "--   update public.restaurants set owner_id = '<auth-user-id>' where slug = 'maqha-alnoor';",
  "",
];

lines.push("-- المطاعم -------------------------------------------------------------");
for (const r of demoRestaurants) {
  lines.push(
    `insert into public.restaurants (id, name, slug, description, short_description, logo_url, cover_url, category, tags, address, city, latitude, longitude, rating, review_count, follower_count, like_count, price_range, is_verified, phone, distance_km, created_at) values (` +
      [
        q(uuidFrom(r.id)),
        q(r.name),
        q(r.slug),
        q(r.description),
        q(r.shortDescription),
        q(r.logoUrl),
        q(r.coverUrl),
        q(r.category),
        arr(r.tags),
        q(r.address),
        q(r.city),
        r.latitude,
        r.longitude,
        r.rating,
        r.reviewCount,
        r.followerCount,
        r.likeCount,
        r.priceRange,
        r.isVerified,
        q(r.phone),
        r.distanceKm,
        ts(r.createdAt),
      ].join(", ") +
      ");",
  );
  for (const h of r.hours) {
    lines.push(
      `insert into public.restaurant_hours (restaurant_id, day_of_week, opens_at, closes_at, is_closed) values (${q(uuidFrom(r.id))}, ${h.dayOfWeek}, ${q(h.opensAt)}, ${q(h.closesAt)}, ${h.isClosed});`,
    );
  }
}

lines.push("", "-- أقسام القوائم -------------------------------------------------------");
for (const c of demoMenuCategories) {
  lines.push(
    `insert into public.menu_categories (id, restaurant_id, name, sort_order) values (${q(uuidFrom(c.id))}, ${q(uuidFrom(c.restaurantId))}, ${q(c.name)}, ${c.sortOrder});`,
  );
}

lines.push("", "-- أصناف القوائم -------------------------------------------------------");
for (const i of demoMenuItems) {
  lines.push(
    `insert into public.menu_items (id, category_id, restaurant_id, name, description, price, currency, image_url, is_available, tags, sort_order, created_at) values (` +
      [
        q(uuidFrom(i.id)),
        q(uuidFrom(i.categoryId)),
        q(uuidFrom(i.restaurantId)),
        q(i.name),
        q(i.description),
        i.price,
        q(i.currency),
        q(i.imageUrl),
        i.isAvailable,
        arr(i.tags),
        i.sortOrder,
        ts(i.createdAt),
      ].join(", ") +
      ");",
  );
}

lines.push("", "-- المنشورات -----------------------------------------------------------");
for (const p of [...demoPosts, ...demoUserPosts]) {
  lines.push(
    `insert into public.posts (id, restaurant_id, caption, image_url, badge, badge_tone, like_count, comment_count, created_at) values (` +
      [
        q(uuidFrom(p.id)),
        q(uuidFrom(p.restaurantId)),
        q(p.caption),
        q(p.imageUrl),
        q(p.badge),
        q(p.badgeTone),
        p.likeCount,
        p.commentCount,
        ts(p.createdAt),
      ].join(", ") +
      ");",
  );
}

lines.push("", "-- التعليقات -----------------------------------------------------------");
for (const c of demoComments) {
  lines.push(
    `insert into public.post_comments (id, post_id, author_name, author_avatar, body, created_at) values (${q(uuidFrom(c.id))}, ${q(uuidFrom(c.postId))}, ${q(c.authorName)}, ${q(c.authorAvatar)}, ${q(c.body)}, ${ts(c.createdAt)});`,
  );
}

lines.push("", "-- القصص (صالحة 24 ساعة من لحظة التشغيل) --------------------------------");
for (const s of demoStories) {
  const ageHours = Math.max(
    0,
    Math.round((Date.now() - new Date(s.createdAt).getTime()) / 3_600_000),
  );
  lines.push(
    `insert into public.restaurant_stories (id, restaurant_id, title, image_url, caption, created_at, expires_at) values (${q(uuidFrom(s.id))}, ${q(uuidFrom(s.restaurantId))}, ${q(s.title)}, ${q(s.imageUrl)}, ${q(s.caption)}, now() - interval '${ageHours} hours', now() + interval '${24 - ageHours} hours');`,
  );
}

lines.push("", "-- التقييمات -----------------------------------------------------------");
for (const r of demoReviews) {
  lines.push(
    `insert into public.reviews (id, restaurant_id, author_name, author_avatar, rating, comment, created_at) values (${q(uuidFrom(r.id))}, ${q(uuidFrom(r.restaurantId))}, ${q(r.authorName)}, ${q(r.authorAvatar)}, ${r.rating}, ${q(r.comment)}, ${ts(r.createdAt)});`,
  );
}

lines.push(
  "",
  "-- إعادة احتساب التقييمات المخزّنة (المحفّز يتولى ذلك تلقائياً عند الإدراج)",
  "commit;",
  "",
);

const target = join(process.cwd(), "supabase", "seed.sql");
writeFileSync(target, lines.join("\n"), "utf8");
console.log(`تم توليد ${target} (${lines.length} سطراً)`);
