import type { ReactNode } from "react";

const tones = {
  brand: "bg-brand-50 text-brand-700",
  gold: "bg-gold-400/20 text-gold-500",
  danger: "bg-red-50 text-accent-600",
  green: "bg-emerald-50 text-emerald-600",
  neutral: "bg-slate-100 text-slate-600",
};

export default function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
