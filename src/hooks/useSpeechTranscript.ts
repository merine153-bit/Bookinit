import { useCallback, useRef, useState } from "react";

/**
 * تفريغ نصي مباشر للكلام الفرنسي عبر Web Speech API (متوفر في متصفحات
 * Chromium). يُستخدم كطبقة تفريغ سريعة ومجانية قبل إرسال النص للتصحيح
 * بواسطة وكيل الذكاء الاصطناعي. في المتصفحات غير المدعومة يبقى التسجيل
 * الصوتي نفسه متاحًا ويُرفع للتصحيح دون تفريغ فوري.
 */

interface SpeechRecognitionResultLike {
  transcript: string;
}

export function useSpeechTranscript() {
  const [transcript, setTranscript] = useState("");
  const [isSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const start = useCallback(() => {
    if (!isSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "fr-CA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> }) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [isSupported]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => setTranscript(""), []);

  return { transcript, isSupported, listening, start, stop, reset };
}
