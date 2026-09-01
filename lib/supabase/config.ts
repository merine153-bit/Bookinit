/**
 * مفاتيح Supabase.
 * تدعم صيغة المفاتيح الجديدة (sb_publishable_…) والقديمة (anon JWT) معاً.
 * لا يُستخدم أي مفتاح سرّي في التطبيق — كل الوصول يمر عبر سياسات RLS.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** يُعرض زر Google فقط عند تفعيل المزوّد في لوحة Supabase — تفادياً لزر لا يعمل. */
export const isGoogleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

/**
 * عند غياب متغيرات البيئة يعمل التطبيق في "وضع العرض التجريبي":
 * كل البيانات تُقرأ وتُكتب في مخزن محلي داخل الخادم بدل قاعدة البيانات.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
