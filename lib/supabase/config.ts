export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * عند غياب متغيرات البيئة يعمل التطبيق في "وضع العرض التجريبي":
 * كل البيانات تُقرأ وتُكتب في مخزن محلي داخل الخادم بدل قاعدة البيانات.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
