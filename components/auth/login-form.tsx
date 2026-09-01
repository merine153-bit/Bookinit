"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/dashboard/form-status";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { isGoogleAuthEnabled, isSupabaseConfigured } from "@/lib/supabase/config";
import { demoSignIn } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().optional(),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف"),
});

type FormValues = z.infer<typeof schema>;
type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = React.useState<Mode>("signin");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const onSubmit = async (values: FormValues) => {
    const supabase = createClient();
    if (!supabase) return;

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          })
        : await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: { data: { full_name: values.fullName ?? "" } },
          });

    if (result.error) {
      toast(result.error.message, "error");
      return;
    }
    if (mode === "signup" && !result.data.session) {
      toast("تم إنشاء الحساب — تحقق من بريدك لتأكيد التسجيل.", "info");
      return;
    }
    toast("تم تسجيل الدخول بنجاح");
    router.push("/profile");
    router.refresh();
  };

  const signInWithGoogle = async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast(error.message, "error");
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col gap-stack-lg">
        <div className="rounded-xl bg-secondary-container/40 p-gutter">
          <h2 className="font-display text-label-md text-on-secondary-container mb-1">
            وضع العرض التجريبي
          </h2>
          <p className="font-body text-body-md text-on-secondary-container">
            لم تُربط قاعدة بيانات Supabase بعد، لذا تعمل المصادقة الحقيقية بعد إضافة مفاتيح البيئة.
            حتى ذلك الحين يمكنك الدخول بحساب معاينة لتجربة التطبيق كاملاً.
          </p>
        </div>

        <form action={demoSignIn}>
          <input type="hidden" name="role" value="user" />
          <SubmitButton size="full" variant="primary" pendingLabel="جارٍ الدخول…">
            <UserRound className="size-5" aria-hidden />
            الدخول كمستخدم
          </SubmitButton>
        </form>

        <form action={demoSignIn}>
          <input type="hidden" name="role" value="owner" />
          <SubmitButton size="full" variant="forest" pendingLabel="جارٍ الدخول…">
            <Store className="size-5" aria-hidden />
            الدخول كصاحب مطعم (لوحة التحكم)
          </SubmitButton>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-stack-lg">
      <div role="tablist" aria-label="نوع العملية" className="flex gap-2">
        {(["signin", "signup"] as const).map((option) => (
          <button
            key={option}
            role="tab"
            aria-selected={mode === option}
            onClick={() => setMode(option)}
            className={cn(
              "flex-1 py-3 rounded-full font-body text-label-md transition-colors",
              mode === option
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            {option === "signin" ? "تسجيل الدخول" : "حساب جديد"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-gutter" noValidate>
        {mode === "signup" && (
          <Field label="الاسم الكامل" htmlFor="fullName">
            <Input id="fullName" autoComplete="name" {...register("fullName")} />
          </Field>
        )}

        <Field label="البريد الإلكتروني" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field
          label="كلمة المرور"
          htmlFor="password"
          error={errors.password?.message}
          hint={mode === "signup" ? "8 أحرف على الأقل" : undefined}
        >
          <Input
            id="password"
            type="password"
            dir="ltr"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Button type="submit" size="full" disabled={isSubmitting}>
          <LogIn className="size-5" aria-hidden />
          {mode === "signin" ? "تسجيل الدخول" : "إنشاء الحساب"}
        </Button>
      </form>

      {isGoogleAuthEnabled && (
        <>
          <div className="flex items-center gap-4">
            <hr className="flex-1 border-t border-outline-variant/40" />
            <span className="font-body text-label-sm text-on-surface-variant">أو</span>
            <hr className="flex-1 border-t border-outline-variant/40" />
          </div>

          <Button variant="secondary" size="full" onClick={signInWithGoogle}>
            المتابعة عبر Google
          </Button>
        </>
      )}
    </div>
  );
}
