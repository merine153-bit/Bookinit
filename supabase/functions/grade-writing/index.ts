import { corsHeaders, withCors } from "../_shared/cors.ts";
import { askClaude, extractJson } from "../_shared/anthropic.ts";
import { getRequestUser } from "../_shared/authUser.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getRequestUser(req);
  if (!user) return withCors({ error: "غير مصرح" }, 401);

  const { prompt, answer, targetClb = 7 } = await req.json();

  const system = `أنت مصحّح رسمي معتمد لاختبار التعبير الكتابي في TCF Canada. قيّم النص وفق
المعايير الرسمية: احترام الموضوع والحجم المطلوب، تنظيم الأفكار والترابط، ثراء المفردات، صحة
القواعد والتراكيب. أجب حصرًا بكائن JSON صالح بالمخطط التالي (الملاحظات بالعربية):
{
  "score_20": رقم من 0 إلى 20,
  "clb_estimate": رقم تقديري لمستوى CLB بناءً على النتيجة,
  "feedback_ar": "تقييم عام مفصّل بالعربية (نقاط القوة والضعف)",
  "corrections": [{"original": "الجزء الخاطئ", "suggestion": "التصحيح المقترح", "reason_ar": "سبب التصحيح بالعربية"}]
}`;

  const userMsg = `الموضوع المطلوب: "${prompt}"\n\nنص المتعلم:\n"""${answer}"""\n\nمستوى المتعلم المستهدف: CLB ${targetClb}.`;

  try {
    const raw = await askClaude({ system, user: userMsg, maxTokens: 1800 });
    const result = extractJson(raw);
    return withCors(result);
  } catch (e) {
    return withCors({ error: String(e) }, 500);
  }
});
