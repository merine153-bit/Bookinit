import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";

export default function CheckEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="card max-w-md p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <MailCheck size={30} />
        </div>
        <h1 className="mb-2 text-xl font-extrabold text-brand-950">تحقق من بريدك الإلكتروني</h1>
        <p className="mb-6 text-sm text-brand-600">
          أرسلنا رابط تأكيد إلى {email ? <strong>{email}</strong> : "بريدك الإلكتروني"}. اضغط
          على الرابط لتفعيل حسابك والبدء في التعلم.
        </p>
        <Link to="/login" className="text-sm font-bold text-accent-600">
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
