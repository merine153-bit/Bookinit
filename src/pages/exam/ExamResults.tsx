import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Trophy, RotateCcw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { EXAM_SECTIONS } from "../../data/examConfig";
import { overallClbLabel } from "../../lib/scoring";
import Button from "../../components/ui/Button";
import type { ExamAttempt } from "../../types";

export default function ExamResults() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("exam_attempts")
      .select("*")
      .eq("id", attemptId)
      .maybeSingle()
      .then(({ data }) => {
        setAttempt(data as ExamAttempt | null);
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) {
    return <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />;
  }

  if (!attempt?.results) {
    return <p className="text-brand-500">لم يتم العثور على نتائج هذه المحاولة.</p>;
  }

  const { results } = attempt;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card flex flex-col items-center gap-3 bg-brand-950 p-10 text-center text-white">
        <Trophy className="text-gold-400" size={36} />
        <p className="text-sm text-brand-200">نتيجتك الإجمالية التقديرية</p>
        <p className="text-5xl font-extrabold">CLB {results.overall_clb}</p>
        <p className="text-brand-200">{overallClbLabel(results.overall_clb)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.sections.map((s) => {
          const cfg = EXAM_SECTIONS.find((c) => c.kind === s.section);
          return (
            <div key={s.section} className="card p-5">
              <p className="mb-1 font-extrabold text-brand-950">{cfg?.label_ar ?? s.section}</p>
              <p className="mb-3 text-xs text-brand-500">{cfg?.label_fr}</p>
              <div className="mb-2 flex items-end justify-between">
                <span className="text-2xl font-extrabold text-brand-800">
                  {s.scaled_score}/{s.scaled_max}
                </span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                  CLB {s.clb}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-700"
                  style={{ width: `${Math.min(100, (s.scaled_score / s.scaled_max) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/exam" className="flex-1">
          <Button fullWidth variant="secondary" icon={<RotateCcw size={16} />}>
            محاولة جديدة
          </Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button fullWidth>العودة إلى لوحة التحكم</Button>
        </Link>
      </div>
    </div>
  );
}
