import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Play, Sparkles, Loader2 } from "lucide-react";
import { SKILL_LABELS_AR, type SkillArea } from "../../types";
import { SAMPLE_QUESTIONS } from "../../data/sampleQuestions";
import { useAuth } from "../../contexts/AuthContext";
import { generateLesson } from "../../lib/ai";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function LessonsHub() {
  const { skillArea } = useParams<{ skillArea: SkillArea }>();
  const { profile } = useAuth();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLessonReady, setAiLessonReady] = useState(false);

  const questions = SAMPLE_QUESTIONS.filter((q) => q.skill_area === skillArea);

  useEffect(() => {
    setAiError(null);
    setAiLessonReady(false);
  }, [skillArea]);

  async function requestAiLesson() {
    if (!skillArea) return;
    setAiLoading(true);
    setAiError(null);
    try {
      await generateLesson({
        skillArea,
        weakTags: [],
        targetClb: profile?.target_clb ?? 7,
      });
      setAiLessonReady(true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("generate-lesson failed:", e);
      const detail = e instanceof Error ? e.message : String(e);
      setAiError(
        `وكيل الذكاء الاصطناعي غير مفعّل بعد لهذا المشروع، أو حدث خطأ أثناء توليد الدرس. ` +
          `فعّل Edge Functions ومفتاح Gemini API لتوليد دروس مخصصة تلقائيًا.` +
          (detail ? ` (${detail})` : "")
      );
    } finally {
      setAiLoading(false);
    }
  }

  if (!skillArea) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950">{SKILL_LABELS_AR[skillArea]}</h1>
        <p className="text-brand-500">تمارين تفاعلية قصيرة لتقوية هذه المهارة تدريجيًا.</p>
      </div>

      <div className="card flex flex-col items-start justify-between gap-4 border-s-4 border-brand-700 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Sparkles className="text-brand-700" />
          <div>
            <p className="font-extrabold text-brand-950">درس مخصّص بالذكاء الاصطناعي</p>
            <p className="text-sm text-brand-500">
              يولّد وكيل الذكاء الاصطناعي درسًا جديدًا مبنيًا على نقاط ضعفك الحالية.
            </p>
          </div>
        </div>
        <Button size="sm" disabled={aiLoading} onClick={requestAiLesson}>
          {aiLoading ? <Loader2 className="animate-spin" size={16} /> : aiLessonReady ? "تم التوليد ✓" : "ولّد درسًا الآن"}
        </Button>
      </div>
      {aiError && <p className="text-sm text-accent-600">{aiError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {questions.map((q, i) => (
          <Link
            key={q.id}
            to={`/lessons/${skillArea}/${q.id}`}
            className="card card-hover flex items-center justify-between p-5"
          >
            <div>
              <p className="font-extrabold text-brand-950">تمرين {i + 1}</p>
              <p className="mb-2 line-clamp-1 text-xs text-brand-500">{q.prompt}</p>
              <Badge tone="neutral">CLB {q.difficulty_clb}</Badge>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 text-white">
              <Play size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
