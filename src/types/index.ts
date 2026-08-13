export type SkillArea =
  | "comprehension_orale"
  | "comprehension_ecrite"
  | "expression_ecrite"
  | "expression_orale"
  | "grammaire_lexique";

export const SKILL_LABELS: Record<SkillArea, string> = {
  comprehension_orale: "Compréhension Orale",
  comprehension_ecrite: "Compréhension Écrite",
  expression_ecrite: "Expression Écrite",
  expression_orale: "Expression Orale",
  grammaire_lexique: "Grammaire et Lexique",
};

export const SKILL_LABELS_AR: Record<SkillArea, string> = {
  comprehension_orale: "فهم المسموع",
  comprehension_ecrite: "فهم المقروء",
  expression_ecrite: "التعبير الكتابي",
  expression_orale: "التعبير الشفهي",
  grammaire_lexique: "القواعد والمفردات",
};

export type PlanDuration = 1 | 2 | 3 | 6;

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  target_clb: number;
  onboarded: boolean;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
  created_at: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  duration_months: PlanDuration;
  plan_name: string;
  started_at: string;
  target_exam_date: string | null;
  is_active: boolean;
}

export type QuestionType =
  | "mcq"
  | "true_false"
  | "fill_blank"
  | "ordering"
  | "open_written"
  | "open_spoken";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  skill_area: SkillArea;
  section: "orale" | "ecrite" | "grammaire" | "orale_expression" | "ecrite_expression";
  difficulty_clb: number; // 3-10
  type: QuestionType;
  prompt: string;
  audio_url?: string | null;
  passage?: string | null;
  options?: QuestionOption[] | null;
  correct_option_id?: string | null;
  correct_text?: string | null;
  explanation?: string | null;
  source_note?: string | null;
  tags?: string[];
}

export interface LessonProgress {
  id: string;
  user_id: string;
  skill_area: SkillArea;
  completed_count: number;
  total_count: number;
  accuracy: number; // 0-1
  updated_at: string;
}

export type ExamSectionKind =
  | "comprehension_orale"
  | "comprehension_ecrite"
  | "grammaire_lexique"
  | "expression_ecrite"
  | "expression_orale";

export interface ExamAttempt {
  id: string;
  user_id: string;
  mode: "full" | "section";
  status: "in_progress" | "completed" | "abandoned";
  seed: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  results: ExamResults | null;
}

export interface ExamSectionResult {
  section: ExamSectionKind;
  raw_correct: number;
  raw_total: number;
  scaled_score: number; // /699 for comprehension, /20 for expression
  scaled_max: number;
  clb: number;
  nclc: number;
}

export interface ExamResults {
  sections: ExamSectionResult[];
  overall_clb: number;
  overall_label: string;
  generated_at: string;
}

export interface ExamAnswer {
  question_id: string;
  section: ExamSectionKind;
  selected_option_id?: string | null;
  written_answer?: string | null;
  audio_path?: string | null;
  flagged?: boolean;
  time_spent_seconds?: number;
}
