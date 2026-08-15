import { corsHeaders, withCors } from "../_shared/cors.ts";
import { getRequestUser } from "../_shared/authUser.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "gemini-3.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getRequestUser(req);
  if (!user) return withCors({ error: "غير مصرح" }, 401);

  if (!GEMINI_API_KEY) {
    return withCors({ error: "GEMINI_API_KEY غير مضبوط على الخادم." }, 500);
  }

  const { message, history = [], context = "" } = await req.json();

  const system = `أنت "المعلّم الافتراضي" في منصة Passerelle TCF، مدرّس فرنسية كيبيكية ودود
وخبير في التحضير لامتحان TCF Canada. تتحدث مع متعلمين ناطقين بالعربية. اشرح بوضوح وبساطة،
استخدم أمثلة من الفرنسية الكيبيكية عند الإفادة، وشجّع المتعلم. أجب بالعربية أساسًا مع تضمين
أمثلة فرنسية عند الحاجة. ${context ? `سياق إضافي عن حالة المتعلم: ${context}` : ""}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [
            ...history.map((h: { role: string; content: string }) => ({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: h.content }],
            })),
            { role: "user", parts: [{ text: message }] },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.8,
            thinkingConfig: { thinkingBudget: 512 },
          },
        }),
      }
    );

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    return withCors({ reply });
  } catch (e) {
    return withCors({ error: String(e) }, 500);
  }
});
