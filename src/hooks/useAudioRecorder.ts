import { useCallback, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "stopped" | "error";

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setStatus("recording");
      timerRef.current = window.setInterval(() => {
        setDurationSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 250);
    } catch {
      setStatus("error");
      setErrorMessage(
        "تعذّر الوصول إلى الميكروفون. تأكد من منح الإذن للمتصفح لاستخدامه."
      );
    }
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) window.clearInterval(timerRef.current);
    setStatus("stopped");
  }, []);

  const reset = useCallback(() => {
    setAudioUrl(null);
    setAudioBlob(null);
    setDurationSec(0);
    setStatus("idle");
  }, []);

  return { status, audioUrl, audioBlob, durationSec, errorMessage, start, stop, reset };
}
