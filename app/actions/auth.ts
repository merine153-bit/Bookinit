"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DEMO_SESSION_COOKIE } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { DEMO_OWNER_ID } from "@/lib/data/demo";

export interface AuthResult {
  ok: boolean;
  message: string;
}

interface Credentials {
  email: string;
  password: string;
  fullName?: string;
}

/** يترجم رسائل Supabase الإنجليزية إلى رسائل عربية مفهومة. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (m.includes("email not confirmed")) return "لم يُفعّل بريدك بعد — تحقق من رسالة التأكيد.";
  if (m.includes("user already registered")) return "هذا البريد مسجّل مسبقاً. جرّب تسجيل الدخول.";
  if (m.includes("password should be")) return "كلمة المرور قصيرة جداً.";
  if (m.includes("rate limit") || m.includes("too many")) return "محاولات كثيرة — انتظر قليلاً ثم أعد المحاولة.";
  return message;
}

/**
 * تسجيل الدخول على الخادم: الجلسة تُكتب في الكوكيز مباشرة،
 * فلا يحتاج المتصفح للاتصال بـ Supabase ولا يحدث تفاوت بين جلستي العميل والخادم.
 */
export async function signIn({ email, password }: Credentials): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "لم تُربط قاعدة البيانات بعد." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: translateAuthError(error.message) };

  revalidatePath("/", "layout");
  return { ok: true, message: "تم تسجيل الدخول بنجاح." };
}

/** إنشاء حساب جديد. يعيد رسالة مختلفة عندما يتطلب المشروع تأكيد البريد. */
export async function signUp({ email, password, fullName }: Credentials): Promise<AuthResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "لم تُربط قاعدة البيانات بعد." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName?.trim() || "مستخدم Eatit",
        username: `@${email.split("@")[0]}`,
      },
    },
  });
  if (error) return { ok: false, message: translateAuthError(error.message) };

  if (!data.session) {
    return { ok: false, message: "أنشئ حسابك — تحقّق من بريدك لتأكيد التسجيل ثم سجّل الدخول." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "تم إنشاء الحساب بنجاح." };
}

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
