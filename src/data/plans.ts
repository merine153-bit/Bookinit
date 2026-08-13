import type { PlanDuration } from "../types";

export interface PlanOption {
  months: PlanDuration;
  label: string;
  subtitle: string;
  perks: string[];
  highlighted?: boolean;
}

export const PLAN_OPTIONS: PlanOption[] = [
  {
    months: 1,
    label: "شهر واحد",
    subtitle: "مراجعة مكثفة",
    perks: ["وصول كامل للأسئلة", "محاكاة اختبارين", "تصحيح ذكاء اصطناعي محدود"],
  },
  {
    months: 3,
    label: "3 أشهر",
    subtitle: "تأسيس قوي",
    perks: ["كل ميزات الشهر", "تصحيح ذكاء اصطناعي غير محدود", "خطة دروس تكيّفية"],
  },
  {
    months: 2,
    label: "شهران",
    subtitle: "استعداد متوازن",
    perks: ["كل ميزات الشهر", "تصحيح ذكاء اصطناعي (محدود)", "تتبع تقدم أسبوعي"],
    highlighted: true,
  },
  {
    months: 6,
    label: "6 أشهر",
    subtitle: "إتقان كامل",
    perks: ["كل الميزات + دروس ثقافة كيبيكية", "أولوية الدعم", "محاكاة اختبارات غير محدودة"],
  },
];

export function planLabel(months: PlanDuration): string {
  return PLAN_OPTIONS.find((p) => p.months === months)?.label ?? `${months} أشهر`;
}
