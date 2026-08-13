import type { Question, SkillArea } from "../types";

/**
 * محرك اختيار الأسئلة العشوائي لمنع تكرار نفس الامتحان في كل محاولة.
 * يعتمد على "بذرة" (seed) فريدة لكل محاولة + استبعاد الأسئلة التي استُخدمت
 * في آخر N محاولة لنفس المستخدم (تُجلب من جدول user_seen_questions في القاعدة).
 */

// مولّد أرقام عشوائي حتمي (Mulberry32) بحيث يمكن إعادة نفس ترتيب الخلط
// بمعرفة الـ seed فقط (مفيد للتصحيح والتدقيق)، لكنه غير قابل للتخمين
// المسبق من طرف المستخدم لأن الـ seed يُنشأ بشكل عشوائي آمن عند بدء الامتحان.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return h;
}

export function createSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const rng = mulberry32(hashSeed(seed));
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * يختار عددًا N من الأسئلة لكل مهارة، مع إعطاء أولوية لتفادي الأسئلة
 * المستخدمة مؤخرًا (recentlySeenIds)، ثم استكمال العدد من البنك الكامل
 * عند الحاجة (بنك الأسئلة المحدود).
 */
export function pickQuestionsForSection(
  bank: Question[],
  skillArea: SkillArea,
  count: number,
  seed: string,
  recentlySeenIds: Set<string>
): Question[] {
  const pool = bank.filter((q) => q.skill_area === skillArea);
  const fresh = shuffleWithSeed(
    pool.filter((q) => !recentlySeenIds.has(q.id)),
    seed + skillArea
  );
  const used = shuffleWithSeed(
    pool.filter((q) => recentlySeenIds.has(q.id)),
    seed + skillArea + "-used"
  );
  return [...fresh, ...used].slice(0, count);
}
