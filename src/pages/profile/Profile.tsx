import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/Button";
import { planLabel } from "../../data/plans";
import type { StudyPlan } from "../../types";

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [targetClb, setTargetClb] = useState(profile?.target_clb ?? 7);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("study_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => setPlan(data as StudyPlan | null));
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName, target_clb: targetClb }).eq("id", user.id);
    await refreshProfile();
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-extrabold text-brand-950">الملف الشخصي</h1>

      <div className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-bold text-brand-700">الاسم الكامل</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-brand-700">البريد الإلكتروني</label>
          <input
            disabled
            value={user?.email ?? ""}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-brand-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-brand-700">مستوى CLB المستهدف</label>
          <select
            value={targetClb}
            onChange={(e) => setTargetClb(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-brand-500 focus:outline-none"
          >
            {[4, 5, 6, 7, 8, 9, 10].map((v) => (
              <option key={v} value={v}>CLB {v}</option>
            ))}
          </select>
        </div>
        <Button disabled={saving} onClick={save}>
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <div className="card p-6">
        <p className="mb-2 font-extrabold text-brand-950">الخطة الدراسية الحالية</p>
        {plan ? (
          <p className="text-sm text-brand-600">
            {planLabel(plan.duration_months)} — تنتهي في{" "}
            {plan.target_exam_date ? new Date(plan.target_exam_date).toLocaleDateString("ar") : "-"}
          </p>
        ) : (
          <p className="text-sm text-brand-400">لا توجد خطة نشطة حاليًا.</p>
        )}
      </div>
    </div>
  );
}
