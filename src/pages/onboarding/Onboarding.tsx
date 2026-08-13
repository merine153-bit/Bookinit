import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/Button";
import { PLAN_OPTIONS } from "../../data/plans";
import type { PlanDuration } from "../../types";

const CLB_TARGETS = [
  { value: 5, label: "CLB 5 — مستوى متوسط" },
  { value: 7, label: "CLB 7 — الأكثر طلبًا للهجرة (Entry Express)" },
  { value: 9, label: "CLB 9 — مستوى متقدم" },
  { value: 10, label: "CLB 10 — إتقان كامل" },
];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [months, setMonths] = useState<PlanDuration>(2);
  const [targetClb, setTargetClb] = useState(7);
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (!user) return;
    setSaving(true);

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);

    await Promise.all([
      supabase
        .from("profiles")
        .update({ onboarded: true, target_clb: targetClb })
        .eq("id", user.id),
      supabase.from("study_plans").insert({
        user_id: user.id,
        duration_months: months,
        plan_name: `خطة ${months} ${months === 1 ? "شهر" : "أشهر"}`,
        target_exam_date: targetDate.toISOString().slice(0, 10),
        is_active: true,
      }),
    ]);

    await refreshProfile();
    setSaving(false);
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-white">
            <GraduationCap size={20} />
          </div>
          <span className="text-xl font-extrabold text-brand-950">Passerelle TCF</span>
        </div>

        <div className="card p-8">
          <div className="mb-8 flex items-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-brand-800" : "bg-slate-200"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <h2 className="mb-1 text-xl font-extrabold text-brand-950">ما هو هدفك المستهدف؟</h2>
              <p className="mb-6 text-sm text-brand-500">
                سيساعدنا هذا في تخصيص صعوبة الدروس والامتحانات التجريبية.
              </p>
              <div className="mb-8 grid gap-3 sm:grid-cols-2">
                {CLB_TARGETS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTargetClb(t.value)}
                    className={`flex items-center justify-between rounded-xl border-2 p-4 text-start text-sm font-bold transition-colors ${
                      targetClb === t.value
                        ? "border-brand-700 bg-brand-50 text-brand-900"
                        : "border-slate-200 text-brand-700 hover:border-brand-300"
                    }`}
                  >
                    {t.label}
                    {targetClb === t.value && <CheckCircle2 size={18} className="text-brand-700" />}
                  </button>
                ))}
              </div>
              <Button fullWidth onClick={() => setStep(2)}>
                التالي
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="mb-1 text-xl font-extrabold text-brand-950">اختر خطتك الدراسية</h2>
              <p className="mb-6 text-sm text-brand-500">كم من الوقت تبقى قبل موعد اختبارك؟</p>
              <div className="mb-8 grid gap-3 sm:grid-cols-2">
                {PLAN_OPTIONS.map((p) => (
                  <button
                    key={p.months}
                    onClick={() => setMonths(p.months)}
                    className={`rounded-xl border-2 p-4 text-start transition-colors ${
                      months === p.months
                        ? "border-brand-700 bg-brand-50"
                        : "border-slate-200 hover:border-brand-300"
                    }`}
                  >
                    <p className="font-extrabold text-brand-950">{p.label}</p>
                    <p className="text-xs text-brand-500">{p.subtitle}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  رجوع
                </Button>
                <Button fullWidth disabled={saving} onClick={finish}>
                  {saving ? "جاري الإعداد..." : "ابدأ رحلتي"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
