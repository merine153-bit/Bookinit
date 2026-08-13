import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * يتحقق من هوية المستخدم صاحب الطلب عبر رمز الجلسة (JWT) المُمرَّر تلقائيًا
 * من طرف supabase-js (functions.invoke). يعيد null إن كان الرمز غير صالح.
 */
export async function getRequestUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}
