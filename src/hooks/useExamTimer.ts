import { useCallback, useEffect, useRef, useState } from "react";

/**
 * مؤقّت الامتحان: يعتمد على "وقت انتهاء مطلق" (endsAt) محفوظ محليًا وفي قاعدة
 * البيانات بدل عدّاد تنازلي بسيط، بحيث لا يمكن للمستخدم إيقافه أو التلاعب به
 * عبر تحديث الصفحة أو إغلاق التبويب — عند العودة يُحسب الوقت المتبقي من جديد
 * بمقارنة الوقت الحالي بـ endsAt. عند وصول الوقت لصفر يُستدعى onExpire تلقائيًا.
 */
export function useExamTimer(
  attemptId: string,
  totalSeconds: number,
  onExpire: () => void
) {
  const storageKey = `exam_ends_at_${attemptId}`;
  const [endsAt] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return Number(saved);
    const t = Date.now() + totalSeconds * 1000;
    localStorage.setItem(storageKey, String(t));
    return t;
  });

  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((endsAt - Date.now()) / 1000))
  );
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(interval);
        onExpire();
      }
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt]);

  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const label = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { remaining, label, clear, isCritical: remaining <= 60 };
}
