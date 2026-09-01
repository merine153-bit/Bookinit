import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "تسجيل الدخول",
  description: "سجّل الدخول إلى Eatit لحفظ أماكنك المفضلة ومتابعة مطاعمك.",
};

export default function LoginPage() {
  return (
    <main id="main" className="min-h-dvh flex flex-col items-center justify-center px-container-margin py-stack-lg">
      <div className="w-full max-w-md flex flex-col gap-stack-lg">
        <div className="text-center">
          <Brand className="text-headline-lg" />
          <h1 className="font-display text-headline-md text-on-surface mt-stack-md">
            أهلاً بك في Eatit
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            اكتشف المطاعم والمقاهي، واحفظ ما يعجبك.
          </p>
        </div>

        <Card className="p-container-margin">
          <LoginForm />
        </Card>

        <Link
          href="/"
          className="text-center font-body text-label-md text-on-surface-variant hover:text-primary transition-colors"
        >
          المتابعة كضيف ←
        </Link>
      </div>
    </main>
  );
}
