import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, GraduationCap } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/Button";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("already registered")
          ? "هذا البريد الإلكتروني مسجّل بالفعل."
          : "حدث خطأ أثناء إنشاء الحساب. حاول مجددًا."
      );
      return;
    }
    navigate("/check-email", { state: { email } });
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-brand-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-white">
            <GraduationCap size={20} />
          </div>
          <span className="text-xl font-extrabold">Passerelle TCF</span>
        </Link>

        <div className="card p-8">
          <h1 className="mb-1 text-2xl font-extrabold text-brand-950">إنشاء حساب جديد</h1>
          <p className="mb-6 text-sm text-brand-500">
            ابدأ رحلتك المجانية نحو إتقان الفرنسية الكيبيكية اليوم.
          </p>

          <button
            onClick={handleGoogle}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-brand-900 hover:bg-slate-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 6 29.6 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 27 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.5 35.9 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z" />
            </svg>
            التسجيل عبر Gmail
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            أو بالبريد الإلكتروني
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute end-3 top-3.5 text-slate-400" size={18} />
              <input
                required
                placeholder="الاسم الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pe-10 ps-4 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute end-3 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                required
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pe-10 ps-4 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute end-3 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                required
                placeholder="كلمة المرور (8 أحرف على الأقل)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-3 pe-10 ps-4 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm font-semibold text-accent-600">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-600">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="font-bold text-accent-600">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
