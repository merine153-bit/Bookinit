import type { ExamSectionKind, ExamSectionResult } from "../types";

/**
 * جداول تقريبية لتحويل النتيجة إلى مستوى CLB / NCLC، مبنية على جداول التعادل
 * الرسمية المنشورة من طرف IRCC وFrance Éducation international لامتحان TCF Canada.
 * هذا تقريب تعليمي لأغراض التدرّب فقط، وليس الخوارزمية الرسمية السرية للتصحيح
 * (التي تعتمد على نظرية الاستجابة للمفردة IRT ولا يمكن إعادة إنتاجها بدقة).
 */

interface Band {
  min: number;
  max: number;
  clb: number;
  nclc: number;
}

// فهم المسموع / فهم المقروء: من 0 إلى 699
const COMPREHENSION_BANDS: Band[] = [
  { min: 0, max: 330, clb: 3, nclc: 3 },
  { min: 331, max: 368, clb: 4, nclc: 4 },
  { min: 369, max: 397, clb: 5, nclc: 5 },
  { min: 398, max: 457, clb: 6, nclc: 6 },
  { min: 458, max: 502, clb: 7, nclc: 7 },
  { min: 503, max: 522, clb: 8, nclc: 8 },
  { min: 523, max: 548, clb: 9, nclc: 9 },
  { min: 549, max: 699, clb: 10, nclc: 10 },
];

// التعبير الكتابي / التعبير الشفهي: من 0 إلى 20
const EXPRESSION_BANDS: Band[] = [
  { min: 0, max: 3, clb: 3, nclc: 3 },
  { min: 4, max: 5, clb: 4, nclc: 4 },
  { min: 6, max: 6, clb: 5, nclc: 5 },
  { min: 7, max: 9, clb: 6, nclc: 6 },
  { min: 10, max: 11, clb: 7, nclc: 7 },
  { min: 12, max: 13, clb: 8, nclc: 8 },
  { min: 14, max: 15, clb: 9, nclc: 9 },
  { min: 16, max: 20, clb: 10, nclc: 10 },
];

const isComprehension = (section: ExamSectionKind) =>
  section === "comprehension_orale" ||
  section === "comprehension_ecrite" ||
  section === "grammaire_lexique";

function bandFor(section: ExamSectionKind, scaled: number): Band {
  const bands = isComprehension(section) ? COMPREHENSION_BANDS : EXPRESSION_BANDS;
  return (
    bands.find((b) => scaled >= b.min && scaled <= b.max) ?? bands[bands.length - 1]
  );
}

/**
 * يحوّل النسبة المئوية للإجابات الصحيحة إلى نقطة داخل مقياس الامتحان الرسمي
 * (699 لفهم المسموع/المقروء والقواعد، 20 للتعبير)، عبر توزيع خطي مرجّح بجودة
 * الإجابات داخل كل شريحة صعوبة — تقريب معقول لمحاكاة تعليمية.
 */
export function scoreSection(
  section: ExamSectionKind,
  rawCorrect: number,
  rawTotal: number
): ExamSectionResult {
  const max = isComprehension(section) ? 699 : 20;
  const ratio = rawTotal > 0 ? rawCorrect / rawTotal : 0;
  const scaled = Math.round(ratio * max);
  const band = bandFor(section, scaled);

  return {
    section,
    raw_correct: rawCorrect,
    raw_total: rawTotal,
    scaled_score: scaled,
    scaled_max: max,
    clb: band.clb,
    nclc: band.nclc,
  };
}

/**
 * لأقسام التعبير (كتابي/شفهي) حيث يقيّم وكيل الذكاء الاصطناعي كل إجابة
 * مباشرة على مقياس /20، نستخدم متوسط النقاط كنتيجة القسم مباشرة بدل نسبة
 * الإجابات الصحيحة.
 */
export function scoreExpressionSection(
  section: ExamSectionKind,
  scores20: number[]
): ExamSectionResult {
  const max = 20;
  const scaled = scores20.length
    ? Math.round(scores20.reduce((a, b) => a + b, 0) / scores20.length)
    : 0;
  const band = bandFor(section, scaled);

  return {
    section,
    raw_correct: scaled,
    raw_total: max,
    scaled_score: scaled,
    scaled_max: max,
    clb: band.clb,
    nclc: band.nclc,
  };
}

export function overallClbLabel(clb: number): string {
  if (clb >= 10) return "الأعلى — إتقان تام (CLB 10)";
  if (clb >= 9) return "متقدم جدًا (CLB 9)";
  if (clb >= 7) return "متقدم (CLB 7-8)";
  if (clb >= 5) return "متوسط (CLB 5-6)";
  if (clb >= 4) return "أساسي (CLB 4)";
  return "دون CLB 4 — يحتاج تدربًا إضافيًا";
}

export function computeOverallClb(sections: ExamSectionResult[]): number {
  if (sections.length === 0) return 0;
  const sum = sections.reduce((acc, s) => acc + s.clb, 0);
  return Math.round((sum / sections.length) * 10) / 10;
}
