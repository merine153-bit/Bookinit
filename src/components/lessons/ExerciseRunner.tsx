import { useState } from "react";
import { Volume2, Mic, Square, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Question } from "../../types";
import Button from "../ui/Button";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { useSpeechTranscript } from "../../hooks/useSpeechTranscript";
import { gradeWriting, gradeSpeaking } from "../../lib/ai";

interface Props {
  question: Question;
  targetClb: number;
  onAnswered: (correct: boolean, meta?: Record<string, unknown>) => void;
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fr-CA";
  utter.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export default function ExerciseRunner({ question, targetClb, onAnswered }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [grading, setGrading] = useState(false);

  const recorder = useAudioRecorder();
  const speech = useSpeechTranscript();

  const isListening = question.section === "orale" && !!question.passage;

  function submitMcq(optionId: string) {
    if (revealed) return;
    setSelected(optionId);
    setRevealed(true);
    const correct = optionId === question.correct_option_id;
    onAnswered(correct);
  }

  async function submitWritten() {
    setGrading(true);
    try {
      const res = await gradeWriting({
        prompt: question.prompt,
        answer: textAnswer,
        targetClb,
      });
      setAiFeedback(res.feedback_ar);
      setAiScore(res.score_20);
      onAnswered(res.score_20 >= 12, { score: res.score_20 });
    } catch {
      setAiFeedback(
        "تعذّر الاتصال بوكيل التصحيح الذكي حاليًا. تأكد من تفعيل Edge Functions ومفتاح Anthropic في مشروع Supabase."
      );
    } finally {
      setGrading(false);
      setRevealed(true);
    }
  }

  async function submitSpoken() {
    setGrading(true);
    try {
      const res = await gradeSpeaking({
        prompt: question.prompt,
        transcript: speech.transcript,
        targetClb,
      });
      setAiFeedback(res.feedback_ar);
      setAiScore(res.score_20);
      onAnswered(res.score_20 >= 12, { score: res.score_20 });
    } catch {
      setAiFeedback(
        "تعذّر الاتصال بوكيل التصحيح الذكي حاليًا. تأكد من تفعيل Edge Functions ومفتاح Anthropic في مشروع Supabase."
      );
    } finally {
      setGrading(false);
      setRevealed(true);
    }
  }

  return (
    <div className="card space-y-5 p-6">
      {question.passage && (
        <div className="rounded-xl bg-brand-50 p-4">
          {isListening && (
            <button
              onClick={() => speak(question.passage!)}
              className="mb-3 flex items-center gap-2 rounded-lg bg-brand-800 px-3 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              <Volume2 size={16} /> استمع للمقطع (صوت متصفح تجريبي)
            </button>
          )}
          <p className={`text-sm leading-relaxed text-brand-800 ${isListening ? "opacity-60" : ""}`}>
            {question.passage}
          </p>
        </div>
      )}

      <p className="text-lg font-bold text-brand-950">{question.prompt}</p>

      {question.type === "mcq" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isCorrect = opt.id === question.correct_option_id;
            const isSelected = opt.id === selected;
            return (
              <button
                key={opt.id}
                disabled={revealed}
                onClick={() => submitMcq(opt.id)}
                className={`flex w-full items-center justify-between rounded-xl border-2 p-3.5 text-start text-sm font-semibold transition-colors ${
                  revealed && isCorrect
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : revealed && isSelected && !isCorrect
                      ? "border-accent-400 bg-red-50 text-accent-700"
                      : "border-slate-200 hover:border-brand-300"
                }`}
              >
                {opt.text}
                {revealed && isCorrect && <CheckCircle2 size={18} />}
                {revealed && isSelected && !isCorrect && <XCircle size={18} />}
              </button>
            );
          })}
          {revealed && question.explanation && (
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-brand-600">💡 {question.explanation}</p>
          )}
        </div>
      )}

      {question.type === "open_written" && (
        <div className="space-y-3">
          <textarea
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={revealed}
            rows={6}
            placeholder="اكتب إجابتك بالفرنسية هنا..."
            className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-brand-500 focus:outline-none"
          />
          {!revealed && (
            <Button disabled={grading || !textAnswer.trim()} onClick={submitWritten}>
              {grading ? <Loader2 className="animate-spin" size={16} /> : "أرسل للتصحيح الذكي"}
            </Button>
          )}
          {aiFeedback && (
            <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              {aiScore !== null && (
                <p className="mb-1 font-extrabold">النتيجة التقديرية: {aiScore}/20</p>
              )}
              <p>{aiFeedback}</p>
            </div>
          )}
        </div>
      )}

      {question.type === "open_spoken" && (
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
                disabled={revealed}
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
                }}
              >
                إيقاف ({recorder.durationSec}ث)
              </Button>
            )}
            {recorder.audioUrl && <audio controls src={recorder.audioUrl} className="h-9" />}
          </div>
          {recorder.errorMessage && (
            <p className="text-sm text-accent-600">{recorder.errorMessage}</p>
          )}
          {speech.transcript && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-brand-700">
              <span className="font-bold">التفريغ النصي التلقائي: </span>
              {speech.transcript}
            </div>
          )}
          {!speech.isSupported && (
            <p className="text-xs text-brand-400">
              التفريغ الفوري غير مدعوم في هذا المتصفح، لكن يمكنك إرسال التسجيل مباشرة للتصحيح.
            </p>
          )}
          {recorder.status === "stopped" && !revealed && (
            <Button disabled={grading} onClick={submitSpoken}>
              {grading ? <Loader2 className="animate-spin" size={16} /> : "أرسل للتصحيح الذكي"}
            </Button>
          )}
          {aiFeedback && (
            <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
              {aiScore !== null && (
                <p className="mb-1 font-extrabold">النتيجة التقديرية: {aiScore}/20</p>
              )}
              <p>{aiFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
