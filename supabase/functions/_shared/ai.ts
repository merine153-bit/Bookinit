/**
 * غلاف بسيط لاستدعاء Google Gemini API (طبقة مجانية سخية، لا تتطلب بطاقة
 * دفع) من Deno Edge Function. المفتاح يُقرأ من متغير بيئة سرّي
 * (GEMINI_API_KEY) — لا يُكشف أبدًا للمتصفح.
 *
 * احصل على مفتاح مجاني من: https://aistudio.google.com/apikey
 */
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "gemini-3.5-flash";

export async function askAI(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY غير مضبوط. أضفه عبر: supabase secrets set GEMINI_API_KEY=AIza..."
    );
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.system }] },
        contents: [{ role: "user", parts: [{ text: params.user }] }],
        generationConfig: {
          maxOutputTokens: params.maxTokens ?? 4096,
          temperature: 0.8,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  return text;
}

/** يستخرج أول كتلة JSON صالحة من نص رد النموذج (حتى لو أحاطها بشرح أو ```json). */
export function extractJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf(cleaned.trimStart()[0] === "[" ? "[" : "{");
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  const slice = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}
