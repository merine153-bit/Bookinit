import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** تنسيق الأرقام بالفواصل العربية-اللاتينية (1,248). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** تنسيق مختصر للأعداد الكبيرة (12.4 ألف). */
export function formatCompact(value: number): string {
  if (value < 1000) return formatNumber(value);
  const thousands = value / 1000;
  const rounded = thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10;
  return `${rounded} ألف`;
}

export function formatPrice(price: number, currency: string): string {
  const amount = Number.isInteger(price) ? price.toString() : price.toFixed(2);
  return currency === "$" ? `${amount}$` : `${amount} ${currency}`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} م`;
  return `${km.toFixed(1)} كم`;
}

const RELATIVE_UNITS: Array<[number, Intl.RelativeTimeFormatUnit]> = [
  [60, "second"],
  [3600, "minute"],
  [86400, "hour"],
  [604800, "day"],
  [2629800, "week"],
  [31557600, "month"],
];

/** "قبل ساعتين" — صياغة عربية طبيعية للوقت النسبي. */
export function timeAgo(isoDate: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  const formatter = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

  if (seconds < 60) return "الآن";
  for (let i = 1; i < RELATIVE_UNITS.length; i++) {
    const [limit, unit] = RELATIVE_UNITS[i];
    if (seconds < limit) {
      const divisor = RELATIVE_UNITS[i - 1][0];
      return formatter.format(-Math.floor(seconds / divisor), unit);
    }
  }
  return formatter.format(-Math.floor(seconds / 31557600), "year");
}

/** حالة العمل الحالية بناءً على ساعات العمل المسجلة. */
export function openingStatus(
  hours: Array<{ dayOfWeek: number; opensAt: string; closesAt: string; isClosed: boolean }>,
  now = new Date(),
): { isOpen: boolean; label: string; detail: string } {
  const today = hours.find((h) => h.dayOfWeek === now.getDay());
  if (!today || today.isClosed) {
    return { isOpen: false, label: "مغلق", detail: "مغلق اليوم" };
  }
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  const opens = toMinutes(today.opensAt);
  let closes = toMinutes(today.closesAt);
  // إغلاق بعد منتصف الليل
  if (closes <= opens) closes += 24 * 60;
  const current = minutes < opens ? minutes + 24 * 60 : minutes;
  const isOpen = current >= opens && current < closes;

  return {
    isOpen,
    label: isOpen ? "مفتوح" : "مغلق",
    detail: isOpen ? `يغلق ${formatClock(today.closesAt)}` : `يفتح ${formatClock(today.opensAt)}`,
  };
}

/** "23:30" → "11:30 م" */
export function formatClock(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "م" : "ص";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** مسافة هافرساين بالكيلومترات. */
export function distanceBetween(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** تطبيع النص العربي للبحث: إزالة التشكيل وتوحيد الألف والتاء المربوطة. */
export function normalizeArabic(text: string): string {
  return text
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .toLowerCase()
    .trim();
}

export function slugify(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .toLowerCase();
}
