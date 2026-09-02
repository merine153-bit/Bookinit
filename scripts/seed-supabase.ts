/**
 * يرفع بيانات العرض العربية إلى مشروع Supabase عبر PostgREST.
 *
 * التشغيل:
 *   SUPABASE_URL=... SUPABASE_SECRET_KEY=... npm run seed:push
 *
 * المفتاح السري يُقرأ من البيئة فقط ولا يُخزَّن في المستودع.
 * السكربت قابل لإعادة التشغيل: يمسح البيانات السابقة ثم يعيد إدراجها.
 */
import { createHash } from "node:crypto";
import {
  demoComments,
  demoMenuCategories,
  demoMenuItems,
  demoPosts,
  demoRestaurants,
  demoReviews,
  demoStories,
  demoUserPosts,
} from "../lib/data/demo";

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SECRET = process.env.SUPABASE_SECRET_KEY;

if (!URL_BASE || !SECRET) {
  console.error("مطلوب: SUPABASE_URL و SUPABASE_SECRET_KEY في البيئة.");
  process.exit(1);
}

const headers = {
  apikey: SECRET,
  Authorization: `Bearer ${SECRET}`,
  "Content-Type": "application/json",
};

/** هل هجرة الرصيد التاريخي (0003) مطبَّقة على هذه القاعدة؟ */
let hasBaseline = false;

async function detectBaseline() {
  const probe = await fetch(`${URL_BASE}/rest/v1/restaurants?select=base_rating&limit=1`, { headers });
  hasBaseline = probe.ok;
}

/** معرّف UUID ثابت مشتق من معرّف نصي — يجعل التشغيل قابلاً للتكرار. */
function uuidFrom(value: string): string {
  const h = createHash("md5").update(`eatit:${value}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

async function request(method: string, path: string, body?: unknown, prefer?: string) {
  const response = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method,
    headers: prefer ? { ...headers, Prefer: prefer } : headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} → ${response.status} ${await response.text()}`);
  }
  return response;
}

async function wipe(table: string) {
  await request("DELETE", `${table}?id=not.is.null`);
}

async function insert(table: string, rows: unknown[]) {
  if (rows.length === 0) return;
  // إدراج على دفعات لتفادي طلبات ضخمة
  for (let i = 0; i < rows.length; i += 200) {
    await request("POST", table, rows.slice(i, i + 200), "resolution=merge-duplicates");
  }
  console.log(`  ${table.padEnd(20)} ${rows.length}`);
}

/** يربط حساب المصادقة بمطعمه ويمنحه دور صاحب مطعم. */
async function linkOwner(email: string, slug: string, fullName: string, username: string) {
  const listed = await fetch(`${URL_BASE}/auth/v1/admin/users?per_page=200`, { headers });
  const { users } = (await listed.json()) as { users: Array<{ id: string; email: string }> };
  const account = users.find((u) => u.email === email);
  if (!account) {
    console.log(`  تخطٍّ: لا يوجد حساب بالبريد ${email}`);
    return;
  }

  await request(
    "POST",
    "users",
    [
      {
        id: account.id,
        username,
        full_name: fullName,
        role: "RESTAURANT_OWNER",
        bio: "قهوة مختصة وأجواء هادئة في قلب الرياض.",
        avatar_url: "/images/r-noor-logo.jpg",
      },
    ],
    "resolution=merge-duplicates",
  );
  await request("PATCH", `restaurants?slug=eq.${slug}`, { owner_id: account.id });
  console.log(`  ربط ${email} بمطعم ${slug}`);
}


/**
 * يعيد أرقام التقييم المتراكمة إلى قيمها المصمَّمة.
 *
 * محفّز قاعدة البيانات يحسب المتوسط من جدول reviews وحده، فمطعم له تقييمان
 * يظهر بـ«5.0 من تقييمين» بدل رقمه الحقيقي. الحل الصحيح هو هجرة
 * 0003_rating_baseline.sql التي تفصل الرصيد التاريخي عن التقييمات الحيّة؛
 * فإن كانت مطبَّقة نكتفي بها، وإلا نعيد ضبط الأرقام مباشرة كحل احتياطي.
 */
async function restoreAggregates() {
  if (hasBaseline) {
    console.log("  هجرة الرصيد التاريخي مطبَّقة — المحفّز يتولى الحساب.");
    return;
  }

  console.log("استعادة أرقام التقييم المصمَّمة…");
  for (const r of demoRestaurants) {
    await request("PATCH", `restaurants?id=eq.${uuidFrom(r.id)}`, {
      rating: r.rating,
      review_count: r.reviewCount,
    });
  }
  console.log(
    `  أُعيد ضبط ${demoRestaurants.length} مطعماً. ` +
      "لجعل التقييمات الجديدة تُحدّث المتوسط تلقائياً، طبّق supabase/migrations/0003_rating_baseline.sql.",
  );
}

async function main() {
  await detectBaseline();
  console.log(
    hasBaseline
      ? "هجرة الرصيد التاريخي مطبَّقة."
      : "هجرة الرصيد التاريخي غير مطبَّقة — سيُستخدم الحل الاحتياطي.",
  );

  console.log("مسح البيانات السابقة…");
  for (const table of [
    "post_comments",
    "post_likes",
    "posts",
    "restaurant_stories",
    "reviews",
    "menu_items",
    "menu_categories",
    "restaurant_hours",
    "restaurant_followers",
    "restaurants",
  ]) {
    await wipe(table);
  }

  console.log("إدراج البيانات…");
  await insert(
    "restaurants",
    demoRestaurants.map((r) => ({
      id: uuidFrom(r.id),
      name: r.name,
      slug: r.slug,
      description: r.description,
      short_description: r.shortDescription,
      logo_url: r.logoUrl,
      cover_url: r.coverUrl,
      category: r.category,
      tags: r.tags,
      address: r.address,
      city: r.city,
      latitude: r.latitude,
      longitude: r.longitude,
      rating: r.rating,
      review_count: r.reviewCount,
      // الرصيد التاريخي: يُدمج مع تقييمات جدول reviews عبر محفّز قاعدة البيانات.
      ...(hasBaseline ? { base_rating: r.rating, base_review_count: r.reviewCount } : {}),
      follower_count: r.followerCount,
      like_count: r.likeCount,
      price_range: r.priceRange,
      is_verified: r.isVerified,
      phone: r.phone,
      distance_km: r.distanceKm,
      created_at: r.createdAt,
    })),
  );

  await insert(
    "restaurant_hours",
    demoRestaurants.flatMap((r) =>
      r.hours.map((h) => ({
        id: uuidFrom(`${r.id}:hours:${h.dayOfWeek}`),
        restaurant_id: uuidFrom(r.id),
        day_of_week: h.dayOfWeek,
        opens_at: h.opensAt,
        closes_at: h.closesAt,
        is_closed: h.isClosed,
      })),
    ),
  );

  await insert(
    "menu_categories",
    demoMenuCategories.map((c) => ({
      id: uuidFrom(c.id),
      restaurant_id: uuidFrom(c.restaurantId),
      name: c.name,
      sort_order: c.sortOrder,
    })),
  );

  await insert(
    "menu_items",
    demoMenuItems.map((i) => ({
      id: uuidFrom(i.id),
      category_id: uuidFrom(i.categoryId),
      restaurant_id: uuidFrom(i.restaurantId),
      name: i.name,
      description: i.description,
      price: i.price,
      currency: i.currency,
      image_url: i.imageUrl,
      is_available: i.isAvailable,
      tags: i.tags,
      sort_order: i.sortOrder,
      created_at: i.createdAt,
    })),
  );

  await insert(
    "posts",
    [...demoPosts, ...demoUserPosts].map((p) => ({
      id: uuidFrom(p.id),
      restaurant_id: uuidFrom(p.restaurantId),
      caption: p.caption,
      image_url: p.imageUrl,
      badge: p.badge,
      badge_tone: p.badgeTone,
      like_count: p.likeCount,
      comment_count: p.commentCount,
      created_at: p.createdAt,
    })),
  );

  await insert(
    "post_comments",
    demoComments.map((c) => ({
      id: uuidFrom(c.id),
      post_id: uuidFrom(c.postId),
      author_name: c.authorName,
      author_avatar: c.authorAvatar,
      body: c.body,
      created_at: c.createdAt,
    })),
  );

  await insert(
    "restaurant_stories",
    demoStories.map((s) => ({
      id: uuidFrom(s.id),
      restaurant_id: uuidFrom(s.restaurantId),
      title: s.title,
      image_url: s.imageUrl,
      caption: s.caption,
      created_at: s.createdAt,
      expires_at: s.expiresAt,
    })),
  );

  // التقييمات تُدرج أخيراً لأن محفّز قاعدة البيانات يعيد احتساب متوسط التقييم.
  await insert(
    "reviews",
    demoReviews.map((r) => ({
      id: uuidFrom(r.id),
      restaurant_id: uuidFrom(r.restaurantId),
      author_name: r.authorName,
      author_avatar: r.authorAvatar,
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt,
    })),
  );

  await restoreAggregates();

  console.log("ربط حساب صاحب المطعم…");
  await linkOwner("owner@eatit.app", "maqha-alnoor", "مقهى النور", "@maqha_alnoor");

  console.log("تم.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
