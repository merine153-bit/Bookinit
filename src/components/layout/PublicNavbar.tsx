import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

export default function PublicNavbar() {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-extrabold text-brand-900">
          Passerelle <span className="text-accent-600">TCF</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-bold text-brand-900 md:flex">
          <Link to="/#programs" className="hover:text-accent-600">البرامج</Link>
          <Link to="/#exams" className="hover:text-accent-600">الامتحانات</Link>
          <Link to="/#lessons" className="hover:text-accent-600">الدروس</Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <Button size="sm" onClick={() => navigate("/dashboard")}>
              لوحة التحكم
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate("/login")}>
                تسجيل الدخول
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>
                ابدأ الآن مجانًا
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
