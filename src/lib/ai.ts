import { supabase } from "./supabase";
import type { Question, SkillArea } from "../types";

/**
 * طبقة اتصال بوكيل الذكاء الاصطناعي (Supabase Edge Functions).
 * كل الاستدعاءات تمر عبر Edge Functions التي تحمل مفتاح Anthropic سرًا في
 * الخادم (لا يُكشف أبدًا في المتصفح)، وتتحقق من هوية المستخدم عبر جلسة Supabase.
 */

async function invoke<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw error;
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
