import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ShieldAlert, Sparkles, ListChecks } from "lucide-react";
import { EXAM_SECTIONS, TOTAL_EXAM_MINUTES } from "../../data/examConfig";
import { SAMPLE_QUESTIONS } from "../../data/sampleQuestions";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { createSeed, pickQuestionsForSection } from "../../lib/examEngine";
import { generateExamQuestions } from "../../lib/ai";
import Button from "../../components/ui/Button";
import type { ExamAttempt, Question } from "../../types";

export default function ExamHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [history, setHistory] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("exam_attempts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setHistory((data as ExamAttempt[]) ?? []));
  }, [user]);

  async function startExam() {
    if (!user) return;
    setStarting(true);
    const seed = createSeed();

    // استبعاد الأسئلة المستخدمة في آخر 3 محاولات لتفادي التكرار
    const { data: recentAnswers } = await supabase
      .from("exam_answers")
      .select("question_id, exam_attempts!inner(user_id)")
      .eq("exam_attempts.user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(150);
    const recentIds = new Set((recentAnswers ?? []).map((r: { question_id: string }) => r.question_id));

    // محاولة توليد أسئلة جديدة عبر وكيل الذكاء الاصطناعي، مع الرجوع للبنك
    // المحلي تلقائيًا إن لم تكن Edge Functions مفعّلة بعد
    let pool: Question[] = SAMPLE_QUESTIONS;
    try {
      const aiResult = await generateExamQuestions({
        sections: EXAM_SECTIONS.map((s) => s.skillArea),
        excludeIds: Array.from(recentIds),
        targetClb: 7,
        seed,
      });
      if (aiResult.questions?.length) {
        pool = [...aiResult.questions, ...SAMPLE_QUESTIONS];
      }
    } catch {
      // تجاهل الخطأ، استخدم البنك المحلي كخطة بديلة
    }

    const sectionsPayload = EXAM_SECTIONS.map((cfg) => ({
      kind: cfg.kind,
      questions: pickQuestionsForSection(pool, cfg.skillArea, cfg.questionCount, seed, recentIds),
    }));

    const { data: attempt, error } = await supabase
      .from("exam_attempts")
      .insert({
        user_id: user.id,
        mode: "full",
        status: "in_progress",
        seed,
        duration_seconds: TOTAL_EXAM_MINUTES * 60,
      })
      .select()
      .single();

    setStarting(false);
    if (error || !attempt) return;

    localStorage.setItem(
      `exam_questions_${attempt.id}`,
      JSON.stringify(sectionsPayload)
    );
    navigate(`/exam/run/${attempt.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950">محاكاة إمتحان TCF Canada</h1>
        <p className="text-brand-500">
          بيئة اختبار كاملة تحاكي الامتحان الرسمي: أسئلة عشوائية متجددة، توقيت صارم، وتصحيح فوري.
        </p>
      </div>

      <div className="card divide-y divide-slate-100">
        {EXAM_SECTIONS.map((s) => (
          <div key={s.kind} className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold text-brand-950">{s.label_ar}</p>
              <p className="text-xs text-brand-500">{s.label_fr} · {s.questionCount} أسئلة</p>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-bold text-brand-600">
              <Clock size={15} /> {s.minutes} د
            </span>
          </div>
        ))}
      </div>

      <div className="card flex items-start gap-3 border-s-4 border-accent-500 p-5">
        <ShieldAlert className="mt-0.5 shrink-0 text-accent-600" size={20} />
        <div className="text-sm text-brand-700">
          <p className="mb-1 font-extrabold text-brand-950">قواعد الامتحان</p>
          <ul className="list-inside list-disc space-y-1">
            <li>لا يمكن إيقاف الوقت مؤقتًا بعد بدء الاختبار — يستمر العدّاد حتى أثناء إغلاق الصفحة.</li>
            <li>المقاطع الصوتية تُشغَّل مرة واحدة فقط لكل سؤال.</li>
            <li>الأسئلة تتغير في كل محاولة لضمان تجربة تدريب واقعية وموثوقة.</li>
          </ul>
        </div>
      </div>

      <Button size="lg" fullWidth disabled={starting} onClick={startExam} icon={<Sparkles size={18} />}>
        {starting ? "جاري تجهيز الأسئلة..." : "ابدأ الامتحان الآن"}
      </Button>

      {history.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-brand-950">
            <ListChecks size={18} /> محاولاتك السابقة
          </h2>
          <div className="space-y-2">
            {history.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/exam/results/${a.id}`)}
                className="card card-hover flex w-full items-center justify-between p-4 text-start"
              >
                <span className="text-sm text-brand-600">
                  {a.completed_at ? new Date(a.completed_at).toLocaleDateString("ar") : ""}
                </span>
                <span className="font-extrabold text-brand-950">
                  CLB {a.results?.overall_clb ?? "-"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
