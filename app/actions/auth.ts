"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEMO_SESSION_COOKIE } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { DEMO_OWNER_ID } from "@/lib/data/demo";

const DEMO_IDS = { user: "user-demo", owner: DEMO_OWNER_ID } as const;

/**
 * تسجيل دخول تجريبي — يعمل فقط عندما لا تكون Supabase مهيّأة.
 * هذه جلسة معاينة محلية وليست مصادقة حقيقية.
 */
export async function demoSignIn(formData: FormData) {
  const role = formData.get("role") === "owner" ? "owner" : "user";
  const supabase = await createClient();
  if (supabase) {
    throw new Error("الدخول التجريبي غير متاح بعد ربط Supabase — استخدم بريدك وكلمة المرور.");
  }

  const store = await cookies();
  store.set(DEMO_SESSION_COOKIE, DEMO_IDS[role], {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/", "layout");
  redirect(role === "owner" ? "/dashboard" : "/profile");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();

  const store = await cookies();
  store.delete(DEMO_SESSION_COOKIE);

  revalidatePath("/", "layout");
  redirect("/");
}
