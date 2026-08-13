import { supabase } from "./supabase";
import type { LessonProgress, SkillArea } from "../types";

export async function getLessonProgress(userId: string): Promise<LessonProgress[]> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return [];
  }
  return data as LessonProgress[];
}

export async function upsertLessonProgress(
  userId: string,
  skillArea: SkillArea,
  delta: { completed: number; total: number; correct: number }
) {
  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("skill_area", skillArea)
    .maybeSingle();

  const prevCompleted = existing?.completed_count ?? 0;
  const prevTotal = existing?.total_count ?? 0;
  const prevAccuracySum = (existing?.accuracy ?? 0) * prevCompleted;

  const newCompleted = prevCompleted + delta.completed;
  const newAccuracy =
    newCompleted > 0
      ? (prevAccuracySum + delta.correct) / newCompleted
      : 0;

  await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      skill_area: skillArea,
      completed_count: newCompleted,
      total_count: Math.max(prevTotal, delta.total),
      accuracy: newAccuracy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,skill_area" }
  );
}

export async function addPoints(userId: string, points: number) {
  await supabase.rpc("increment_points", { p_user_id: userId, p_points: points });
}
