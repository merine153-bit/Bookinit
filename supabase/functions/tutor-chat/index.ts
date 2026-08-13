import { corsHeaders, withCors } from "../_shared/cors.ts";
import { getRequestUser } from "../_shared/authUser.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-sonnet-5";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getRequestUser(req);
  if (!user) return withCors({ error: "غير مصرح" }, 401);

  if (!ANTHROPIC_API_KEY) {
    return withCors({ error: "ANTHROPIC_API_KEY غير مضبوط على الخادم." }, 500);
  }

  const { message, history = [], context = "" } = await req.json();

  const system = `أنت "المعلّم الافتراضي" في منصة Passerelle TCF، مدرّس فرنسية كيبيكية ودود
وخبير في التحضير لامتحان TCF Canada. تتحدث مع متعلمين ناطقين بالعربية. اشرح بوضوح وبساطة،
استخدم أمثلة من الفرنسية الكيبيكية عند الإفادة، وشجّع المتعلم. أجب بالعربية أساسًا مع تضمين
أمثلة فرنسية عند الحاجة. ${context ? `سياق إضافي عن حالة المتعلم: ${context}` : ""}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system,
        messages: [
          ...history.map((h: { role: string; content: string }) => ({
            role: h.role,
            content: h.content,
          })),
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const reply = data.content?.[0]?.text ?? "";
    return withCors({ reply });
  } catch (e) {
    return withCors({ error: String(e) }, 500);
  }
});
