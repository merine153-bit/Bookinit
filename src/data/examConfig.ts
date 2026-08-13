import type { ExamSectionKind, SkillArea } from "../types";

export interface ExamSectionConfig {
  kind: ExamSectionKind;
  skillArea: SkillArea;
  label_ar: string;
  label_fr: string;
  minutes: number;
  questionCount: number;
  instructions_ar: string;
}

export const EXAM_SECTIONS: ExamSectionConfig[] = [
  {
    kind: "comprehension_orale",
    skillArea: "comprehension_orale",
    label_ar: "فهم المسموع",
    label_fr: "Compréhension Orale",
    minutes: 12,
    questionCount: 8,
    instructions_ar: "ستستمع إلى مقاطع صوتية قصيرة، كل مقطع يُشغَّل مرة واحدة فقط. أجب عن السؤال بعد الاستماع مباشرة.",
  },
  {
    kind: "comprehension_ecrite",
    skillArea: "comprehension_ecrite",
    label_ar: "فهم المقروء",
    label_fr: "Compréhension Écrite",
    minutes: 15,
    questionCount: 8,
    instructions_ar: "اقرأ كل نص بعناية ثم اختر الإجابة الأنسب من بين الخيارات المقترحة.",
  },
  {
    kind: "grammaire_lexique",
    skillArea: "grammaire_lexique",
    label_ar: "القواعد والمفردات",
    label_fr: "Grammaire et Lexique",
    minutes: 10,
    questionCount: 8,
    instructions_ar: "أكمل الجمل باختيار الصيغة أو المفردة الصحيحة نحويًا.",
  },
  {
    kind: "expression_ecrite",
    skillArea: "expression_ecrite",
    label_ar: "التعبير الكتابي",
    label_fr: "Expression Écrite",
    minutes: 20,
    questionCount: 2,
    instructions_ar: "حرّر النص المطلوب مباشرة. سيقوم الذكاء الاصطناعي بتقييم إجابتك وفق سلّم TCF Canada.",
  },
  {
    kind: "expression_orale",
    skillArea: "expression_orale",
    label_ar: "التعبير الشفهي",
    label_fr: "Expression Orale",
    minutes: 10,
    questionCount: 2,
    instructions_ar: "سجّل إجابتك الصوتية مباشرة بعد قراءة المهمة. سيقوم الذكاء الاصطناعي بتقييم نطقك وتراكيبك.",
  },
];

export const TOTAL_EXAM_MINUTES = EXAM_SECTIONS.reduce((a, s) => a + s.minutes, 0);
