import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flag, Volume2, Mic, Square, ArrowLeft, ArrowRight } from "lucide-react";
import { EXAM_SECTIONS } from "../../data/examConfig";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useExamTimer } from "../../hooks/useExamTimer";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { useSpeechTranscript } from "../../hooks/useSpeechTranscript";
import { scoreSection, scoreExpressionSection, computeOverallClb } from "../../lib/scoring";
import { gradeWriting, gradeSpeaking } from "../../lib/ai";
import Button from "../../components/ui/Button";
import type { ExamAnswer, ExamResults, ExamSectionResult, Question } from "../../types";

interface SectionPayload {
  kind: (typeof EXAM_SECTIONS)[number]["kind"];
  questions: Question[];
}

function speakOnce(text: string, onEnd: () => void) {
  if (!("speechSynthesis" in window)) {
    onEnd();
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fr-CA";
  utter.rate = 0.95;
  utter.onend = onEnd;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function ExamSimulator() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [sections, setSections] = useState<SectionPayload[]>([]);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [playedAudio, setPlayedAudio] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const finishingRef = useRef(false);

  const recorder = useAudioRecorder();
  const speech = useSpeechTranscript();

  useEffect(() => {
    const raw = localStorage.getItem(`exam_questions_${attemptId}`);
    if (raw) setSections(JSON.parse(raw));
  }, [attemptId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const sectionConfig = EXAM_SECTIONS[sectionIdx];
  const currentSection = sections[sectionIdx];
  const question = currentSection?.questions[qIdx];
  const totalQInSection = currentSection?.questions.length ?? 0;

  async function finishSection() {
    if (sectionIdx + 1 < EXAM_SECTIONS.length) {
      setSectionIdx((i) => i + 1);
      setQIdx(0);
    } else {
      await finishExam();
    }
  }

  const timer = useExamTimer(
    `${attemptId}-${sectionIdx}`,
    sectionConfig ? sectionConfig.minutes * 60 : 0,
    () => {
      if (!finishingRef.current) finishSection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  );

  function saveAnswer(patch: Partial<ExamAnswer>) {
    if (!question) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        ...prev[question.id],
        question_id: question.id,
        section: sectionConfig.kind,
        ...patch,
      },
    }));
  }

  function toggleFlag() {
    if (!question) return;
    saveAnswer({ flagged: !answers[question.id]?.flagged });
  }

  function goNext() {
    if (qIdx + 1 < totalQInSection) {
      setQIdx((i) => i + 1);
    } else {
      finishSection();
    }
  }

  async function finishExam() {
    finishingRef.current = true;
    setSubmitting(true);

    const sectionResults: ExamSectionResult[] = [];

    for (const cfg of EXAM_SECTIONS) {
      const payload = sections.find((s) => s.kind === cfg.kind);
      if (!payload) continue;

      if (cfg.kind === "expression_ecrite" || cfg.kind === "expression_orale") {
        const scores: number[] = [];
        for (const q of payload.questions) {
          const ans = answers[q.id];
          try {
            if (cfg.kind === "expression_ecrite") {
              const res = await gradeWriting({
                prompt: q.prompt,
                answer: ans?.written_answer ?? "",
                targetClb: profile?.target_clb ?? 7,
              });
              scores.push(res.score_20);
            } else {
              const res = await gradeSpeaking({
                prompt: q.prompt,
                transcript: ans?.written_answer ?? "",
                targetClb: profile?.target_clb ?? 7,
              });
              scores.push(res.score_20);
            }
          } catch {
            // تقدير احتياطي عند عدم توفر وكيل الذكاء الاصطناعي: بناءً على
            // طول الإجابة كمؤشر أولي فقط لاستمرار عمل المحاكاة
            const len = (ans?.written_answer ?? "").trim().split(/\s+/).filter(Boolean).length;
            scores.push(Math.max(0, Math.min(20, Math.round((len / 60) * 14))));
          }
        }
        sectionResults.push(scoreExpressionSection(cfg.kind, scores));
      } else {
        const correct = payload.questions.filter(
          (q) => answers[q.id]?.selected_option_id === q.correct_option_id
        ).length;
        sectionResults.push(scoreSection(cfg.kind, correct, payload.questions.length));
      }
    }

    const results: ExamResults = {
      sections: sectionResults,
      overall_clb: computeOverallClb(sectionResults),
      overall_label: "",
      generated_at: new Date().toISOString(),
    };

    if (user && attemptId) {
      await supabase
        .from("exam_attempts")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          results,
        })
        .eq("id", attemptId);

      const answerRows = Object.values(answers).map((a) => ({
        exam_attempt_id: attemptId,
        question_id: a.question_id,
        section: a.section,
        selected_option_id: a.selected_option_id ?? null,
        written_answer: a.written_answer ?? null,
        flagged: a.flagged ?? false,
      }));
      if (answerRows.length) {
        await supabase.from("exam_answers").insert(answerRows);
      }
    }

    EXAM_SECTIONS.forEach((_, i) => localStorage.removeItem(`exam_ends_at_${attemptId}-${i}`));
    localStorage.removeItem(`exam_questions_${attemptId}`);

    navigate(`/exam/results/${attemptId}`, { replace: true });
  }

  const questionMap = useMemo(() => currentSection?.questions ?? [], [currentSection]);

  if (!currentSection || !question) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      </div>
    );
  }

  const isListening = sectionConfig.kind === "comprehension_orale";
  const isWritten = sectionConfig.kind === "expression_ecrite";
  const isSpoken = sectionConfig.kind === "expression_orale";
  const isMcq = question.type === "mcq";
  const answered = Boolean(
    answers[question.id]?.selected_option_id || answers[question.id]?.written_answer
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:px-8">
        <div className="text-sm font-bold text-brand-700">
          {qIdx + 1} / {totalQInSection}{" "}
          <span className="text-brand-400">— التقدم</span>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-extrabold tabular-nums ${
            timer.isCritical ? "bg-red-50 text-accent-600" : "bg-brand-50 text-brand-800"
          }`}
        >
          {timer.label}
        </div>
        <div className="text-sm font-extrabold text-brand-950">
          {sectionConfig.label_ar} <span className="text-brand-400">({sectionConfig.label_fr})</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 p-4 md:grid-cols-[220px_1fr] md:p-8">
        <aside className="card h-fit p-4">
          <p className="mb-3 text-sm font-extrabold text-brand-950">خريطة الأسئلة</p>
          <div className="grid grid-cols-5 gap-2 md:grid-cols-4">
            {questionMap.map((q, i) => {
              const a = answers[q.id];
              const isCurrent = i === qIdx;
              const isAnswered = Boolean(a?.selected_option_id || a?.written_answer);
              return (
                <button
                  key={q.id}
                  onClick={() => setQIdx(i)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    isCurrent
                      ? "bg-brand-950 text-white"
                      : isAnswered
                        ? "bg-brand-700 text-white"
                        : "border border-slate-200 text-brand-600"
                  }`}
                >
                  {i + 1}
                  {a?.flagged && (
                    <span className="absolute -top-1 -end-1 h-2 w-2 rounded-full bg-accent-500" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-brand-500">
            <p><span className="me-1.5 inline-block h-2.5 w-2.5 rounded bg-brand-700" /> تمت الإجابة</p>
            <p><span className="me-1.5 inline-block h-2.5 w-2.5 rounded bg-brand-950" /> السؤال الحالي</p>
            <p><span className="me-1.5 inline-block h-2.5 w-2.5 rounded-full bg-accent-500" /> محدد للمراجعة</p>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="card p-4 text-sm text-brand-600">{sectionConfig.instructions_ar}</div>

          <div className="card space-y-5 p-6">
            {question.passage && !isListening && (
              <div className="rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-800">
                {question.passage}
              </div>
            )}

            {isListening && question.passage && (
              <div className="rounded-xl bg-brand-50 p-4">
                <button
                  disabled={playedAudio.has(question.id) || isPlaying}
                  onClick={() => {
                    setIsPlaying(true);
                    setPlayedAudio((prev) => new Set(prev).add(question.id));
                    speakOnce(question.passage!, () => setIsPlaying(false));
                  }}
                  className="flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-brand-300"
                >
                  <Volume2 size={16} />
                  {playedAudio.has(question.id)
                    ? "تم الاستماع (مرة واحدة فقط)"
                    : isPlaying
                      ? "جاري التشغيل..."
                      : "تشغيل المقطع الصوتي"}
                </button>
                <p className="mt-2 text-xs text-brand-400">ملاحظة: يمكنك الاستماع للمقطع الصوتي مرة واحدة فقط.</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-brand-950">{question.prompt}</p>
              <button
                onClick={toggleFlag}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                  answers[question.id]?.flagged
                    ? "border-accent-400 bg-red-50 text-accent-600"
                    : "border-slate-200 text-brand-500"
                }`}
              >
                <Flag size={14} /> تحديد للمراجعة
              </button>
            </div>

            {isMcq && question.options && (
              <div className="space-y-2">
                {question.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => saveAnswer({ selected_option_id: opt.id })}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-3.5 text-start text-sm font-semibold transition-colors ${
                      answers[question.id]?.selected_option_id === opt.id
                        ? "border-brand-700 bg-brand-800 text-white"
                        : "border-slate-200 hover:border-brand-300"
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {isWritten && (
              <textarea
                rows={8}
                placeholder="اكتب إجابتك بالفرنسية هنا..."
                value={answers[question.id]?.written_answer ?? ""}
                onChange={(e) => saveAnswer({ written_answer: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-brand-500 focus:outline-none"
              />
            )}

            {isSpoken && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {recorder.status !== "recording" ? (
                    <Button
                      variant="danger"
                      icon={<Mic size={16} />}
                      onClick={() => {
                        recorder.start();
                        speech.reset();
                        speech.start();
                      }}
                    >
                      ابدأ التسجيل
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      icon={<Square size={16} />}
                      onClick={() => {
                        recorder.stop();
                        speech.stop();
                        saveAnswer({ written_answer: speech.transcript });
                      }}
                    >
                      إيقاف ({recorder.durationSec}ث)
                    </Button>
                  )}
                  {recorder.audioUrl && <audio controls src={recorder.audioUrl} className="h-9" />}
                </div>
                {speech.transcript && (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-brand-700">
                    {speech.transcript}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={qIdx === 0}
              onClick={() => setQIdx((i) => Math.max(0, i - 1))}
              icon={<ArrowRight size={16} />}
            >
              السابق
            </Button>
            <Button
              disabled={submitting || (!answered && qIdx + 1 >= totalQInSection && sectionIdx + 1 >= EXAM_SECTIONS.length)}
              onClick={goNext}
              icon={<ArrowLeft size={16} />}
            >
              {submitting
                ? "جاري إنهاء الامتحان..."
                : qIdx + 1 < totalQInSection
                  ? "التالي"
                  : sectionIdx + 1 < EXAM_SECTIONS.length
                    ? "إنهاء القسم والمتابعة"
                    : "إنهاء الامتحان"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
