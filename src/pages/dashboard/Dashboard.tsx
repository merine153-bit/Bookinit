import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Trophy, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import ProgressRing from "../../components/ui/ProgressRing";
import Button from "../../components/ui/Button";
import { SKILL_LABELS_AR, type LessonProgress, type SkillArea, type ExamAttempt } from "../../types";
import { getLessonProgress } from "../../lib/db";

const SKILLS: SkillArea[] = [
  "comprehension_orale",
  "comprehension_ecrite",
  "grammaire_lexique",
  "expression_ecrite",
  "expression_orale",
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [prog, attempts] = await Promise.all([
        getLessonProgress(user.id),
        supabase
          .from("exam_attempts")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(1),
      ]);
      setProgress(prog);
      setLastAttempt((attempts.data?.[0] as ExamAttempt) ?? null);
      setLoading(false);
    })();
  }, [user]);

  const overallAccuracy =
    progress.length > 0
      ? Math.round((progress.reduce((a, p) => a + p.accuracy, 0) / progress.length) * 100)
      : 0;

  const weakest = [...progress].sort((a, b) => a.accuracy - b.accuracy)[0];
  const weakSkillLabel = weakest ? SKILL_LABELS_AR[weakest.skill_area] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950">
          أهلًا بك، {profile?.full_name?.split(" ")[0] ?? "صديقنا"} 👋
        </h1>
        <p className="text-brand-500">هل أنت مستعد لدرس اليوم نحو هدفك في TCF Canada؟</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/20 text-gold-500">
            <Trophy size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-brand-950">{profile?.total_points ?? 0}</p>
            <p className="text-xs text-brand-500">نقطة مكتسبة</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
            <Flame size={22} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-brand-950">{profile?.current_streak ?? 0} أيام</p>
            <p className="text-xs text-brand-500">سلسلة التدريب المتواصل</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <ProgressRing percent={overallAccuracy} size={56} strokeWidth={6} />
          <div>
            <p className="text-xl font-extrabold text-brand-950">{overallAccuracy}%</p>
            <p className="text-xs text-brand-500">نسبة الإتقان الإجمالية</p>
          </div>
        </div>
      </div>

      {!loading && weakSkillLabel && (
        <div className="card flex flex-col items-start justify-between gap-4 border-s-4 border-accent-500 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="text-accent-600" />
            <div>
              <p className="font-extrabold text-brand-950">توصية الذكاء الاصطناعي</p>
              <p className="text-sm text-brand-600">
                نقطة ضعفك الحالية هي <strong>{weakSkillLabel}</strong>. ننصح بدرس مركّز لتقوية هذه
                المهارة قبل الامتحان القادم.
              </p>
            </div>
          </div>
          <Link to={`/lessons/${weakest!.skill_area}`}>
            <Button size="sm" variant="danger" icon={<ArrowLeft size={16} />}>
              ابدأ المراجعة
            </Button>
          </Link>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-extrabold text-brand-950">مسارات التعلم</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((skill) => {
            const p = progress.find((x) => x.skill_area === skill);
            const pct = p ? Math.round((p.completed_count / Math.max(1, p.total_count)) * 100) : 0;
            return (
              <Link
                key={skill}
                to={`/lessons/${skill}`}
                className="card card-hover flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-extrabold text-brand-950">{SKILL_LABELS_AR[skill]}</p>
                  <p className="text-xs text-brand-500">
                    {p?.completed_count ?? 0}/{p?.total_count ?? 0} مكتمل
                  </p>
                </div>
                <ProgressRing percent={pct} size={54} strokeWidth={5} />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card flex flex-col items-start justify-between gap-4 bg-brand-950 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-lg font-extrabold">محاكاة امتحان TCF Canada كاملة</p>
          <p className="text-sm text-brand-200">
            {lastAttempt?.results
              ? `آخر نتيجة: CLB ${lastAttempt.results.overall_clb}`
              : "لم تخض أي محاولة بعد — ابدأ الآن لتقييم مستواك الحالي."}
          </p>
        </div>
        <Link to="/exam">
          <Button variant="gold">ابدأ محاكاة الامتحان</Button>
        </Link>
      </div>
    </div>
  );
}
