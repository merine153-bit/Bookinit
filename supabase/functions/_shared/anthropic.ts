/**
 * غلاف بسيط لاستدعاء Anthropic Messages API من Deno Edge Function.
 * المفتاح يُقرأ من متغير بيئة سرّي (ANTHROPIC_API_KEY) — لا يُكشف أبدًا للمتصفح.
 */
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-sonnet-5";

export async function askClaude(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY غير مضبوط. أضفه عبر: supabase secrets set ANTHROPIC_API_KEY=sk-ant-..."
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens ?? 2000,
      system: params.system,
      messages: [{ role: "user", content: params.user }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";
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
