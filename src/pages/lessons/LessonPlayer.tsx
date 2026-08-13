import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SAMPLE_QUESTIONS } from "../../data/sampleQuestions";
import { SKILL_LABELS_AR, type SkillArea } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { upsertLessonProgress, addPoints } from "../../lib/db";
import ExerciseRunner from "../../components/lessons/ExerciseRunner";
import Button from "../../components/ui/Button";

export default function LessonPlayer() {
  const { skillArea, lessonId } = useParams<{ skillArea: SkillArea; lessonId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [saving, setSaving] = useState(false);

  const question = useMemo(
    () => SAMPLE_QUESTIONS.find((q) => q.id === lessonId),
    [lessonId]
  );
  const siblings = SAMPLE_QUESTIONS.filter((q) => q.skill_area === skillArea);
  const idx = siblings.findIndex((q) => q.id === lessonId);
  const next = siblings[idx + 1];

  async function handleFinish() {
    if (!user || !skillArea) return;
    setSaving(true);
    await upsertLessonProgress(user.id, skillArea, {
      completed: 1,
      total: siblings.length,
      correct: correct ? 1 : 0,
    });
    if (correct) await addPoints(user.id, 10);
    setSaving(false);
    if (next) {
      navigate(`/lessons/${skillArea}/${next.id}`);
    } else {
      navigate(`/lessons/${skillArea}`);
    }
  }

  if (!question || !skillArea) {
    return <p className="text-brand-500">التمرين غير موجود.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button
        onClick={() => navigate(`/lessons/${skillArea}`)}
        className="flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-900"
      >
        <ArrowRight size={16} /> العودة إلى {SKILL_LABELS_AR[skillArea]}
      </button>

      <ExerciseRunner
        key={question.id}
        question={question}
        targetClb={profile?.target_clb ?? 7}
        onAnswered={(isCorrect) => {
          setAnswered(true);
          setCorrect(isCorrect);
        }}
      />

      {answered && (
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <span className="flex items-center gap-2 text-sm font-bold text-emerald-600">
            <CheckCircle2 size={18} /> +10 نقاط عند المتابعة
          </span>
          <Button disabled={saving} onClick={handleFinish}>
            {saving ? "جاري الحفظ..." : next ? "التمرين التالي" : "إنهاء الدرس"}
          </Button>
        </div>
      )}
    </div>
  );
}
