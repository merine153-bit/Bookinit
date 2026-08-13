import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import PublicNavbar from "../../components/layout/PublicNavbar";
import Footer from "../../components/layout/Footer";
import Button from "../../components/ui/Button";
import { PLAN_OPTIONS } from "../../data/plans";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { PlanDuration } from "../../types";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingMonths, setLoadingMonths] = useState<PlanDuration | null>(null);

  async function choosePlan(months: PlanDuration) {
    if (!user) {
      navigate("/signup");
      return;
    }
    setLoadingMonths(months);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);

    await supabase.from("study_plans").update({ is_active: false }).eq("user_id", user.id);
    await supabase.from("study_plans").insert({
      user_id: user.id,
      duration_months: months,
      plan_name: `خطة ${months} ${months === 1 ? "شهر" : "أشهر"}`,
      target_exam_date: targetDate.toISOString().slice(0, 10),
      is_active: true,
    });
    setLoadingMonths(null);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-brand-950">خطط دراسية تناسب أهدافك</h1>
          <p className="text-brand-500">اختر الباقة الأنسب للوقت المتبقي لاختبارك.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {PLAN_OPTIONS.map((plan) => (
            <div
              key={plan.months}
              className={`card relative flex flex-col p-6 ${plan.highlighted ? "border-2 border-brand-700" : ""}`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-brand-800 px-3 py-1 text-xs font-bold text-white">
                  الأكثر شعبية
                </span>
              )}
              <p className="text-2xl font-extrabold text-brand-950">{plan.label}</p>
              <p className="mb-4 text-sm text-brand-500">{plan.subtitle}</p>
              <ul className="mb-6 flex-1 space-y-2 text-sm text-brand-700">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500" /> {perk}
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                size="sm"
                variant={plan.highlighted ? "primary" : "secondary"}
                disabled={loadingMonths === plan.months}
                onClick={() => choosePlan(plan.months)}
              >
                {loadingMonths === plan.months ? "جاري التفعيل..." : "اختيار الخطة"}
              </Button>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
