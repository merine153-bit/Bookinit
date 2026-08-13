import { type ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Headphones,
  BookOpenText,
  PenLine,
  Mic,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/lessons/comprehension_orale", label: "فهم المسموع", icon: Headphones },
  { to: "/lessons/comprehension_ecrite", label: "فهم المقروء", icon: BookOpenText },
  { to: "/lessons/grammaire_lexique", label: "القواعد والمفردات", icon: GraduationCap },
  { to: "/lessons/expression_ecrite", label: "التعبير الكتابي", icon: PenLine },
  { to: "/lessons/expression_orale", label: "التعبير الشفهي", icon: Mic },
  { to: "/exam", label: "محاكاة الامتحان", icon: Sparkles },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-white">
          <GraduationCap size={20} />
        </div>
        <div>
          <p className="text-base font-extrabold text-brand-950">Passerelle TCF</p>
          <p className="text-[11px] text-brand-500">
            الهدف: CLB {profile?.target_clb ?? 7}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                isActive
                  ? "bg-brand-800 text-white shadow-md shadow-brand-800/20"
                  : "text-brand-700 hover:bg-brand-50"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-4">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-50"
        >
          <Settings size={18} />
          الإعدادات والملف الشخصي
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-accent-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      {/* الشريط الجانبي - سطح المكتب */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-s border-slate-100 bg-white md:block">
        {SidebarContent}
      </aside>

      {/* الشريط الجانبي - جوال */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-72 bg-white shadow-xl">{SidebarContent}</div>
          <button
            className="flex-1 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق القائمة"
          />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:hidden">
          <span className="font-extrabold text-brand-950">Passerelle TCF</span>
          <button onClick={() => setMobileOpen(true)} aria-label="فتح القائمة">
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
