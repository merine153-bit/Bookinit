import { supabase } from "./supabase";
import type { Question, SkillArea } from "../types";

/**
 * طبقة اتصال بوكيل الذكاء الاصطناعي (Supabase Edge Functions).
 * كل الاستدعاءات تمر عبر Edge Functions التي تحمل مفتاح Gemini سرًا في
 * الخادم (لا يُكشف أبدًا في المتصفح)، وتتحقق من هوية المستخدم عبر جلسة Supabase.
 */

async function invoke<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    // FunctionsHttpError.message هو نص عام ("non-2xx status code")، لذا نحاول
    // قراءة جسم استجابة الخطأ الفعلي (context) الذي أرجعته دالتنا لعرض السبب
    // الحقيقي بدل رسالة مبهمة.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = (error as any)?.context;
    let realMessage: string | null = null;
    if (context && typeof context.json === "function") {
      try {
        const body = await context.json();
        if (body?.error) realMessage = String(body.error);
      } catch {
        /* تعذّرت قراءة جسم الاستجابة، سنرمي الخطأ الأصلي أدناه */
      }
    }
    throw realMessage ? new Error(realMessage) : error;
  }
  if (data && typeof data === "object" && "error" in (data as Record<string, unknown>)) {
    throw new Error(String((data as Record<string, unknown>).error));
  }
  return data as T;
}

export async function generateLesson(params: {
  skillArea: SkillArea;
  weakTags: string[];
  targetClb: number;
}) {
  return invoke<{
    title: string;
    title_ar: string;
    explanation_ar: string;
    exercises: Question[];
  }>("generate-lesson", params);
}

export async function generateExamQuestions(params: {
  sections: SkillArea[];
  excludeIds: string[];
  targetClb: number;
  seed: string;
}) {
  return invoke<{ questions: Question[] }>("generate-exam", params);
}

export async function gradeWriting(params: {
  prompt: string;
  answer: string;
  targetClb: number;
}) {
  return invoke<{
    score_20: number;
    clb_estimate: number;
    feedback_ar: string;
    corrections: { original: string; suggestion: string; reason_ar: string }[];
  }>("grade-writing", params);
}

export async function gradeSpeaking(params: {
  prompt: string;
  transcript: string;
  audioPath?: string;
  targetClb: number;
}) {
  return invoke<{
    score_20: number;
    clb_estimate: number;
    feedback_ar: string;
    pronunciation_notes_ar: string;
  }>("grade-speaking", params);
}

export async function tutorChat(params: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  context?: string;
}) {
  return invoke<{ reply: string }>("tutor-chat", params);
}
