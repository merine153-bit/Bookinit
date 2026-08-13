import { corsHeaders, withCors } from "../_shared/cors.ts";
import { askClaude, extractJson } from "../_shared/anthropic.ts";
import { getRequestUser } from "../_shared/authUser.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getRequestUser(req);
  if (!user) return withCors({ error: "غير مصرح" }, 401);

  const { prompt, transcript, targetClb = 7 } = await req.json();

  if (!transcript || !transcript.trim()) {
    return withCors({
      score_20: 0,
      clb_estimate: 0,
      feedback_ar: "لم يتم رصد أي كلام في التسجيل. تأكد من السماح للمتصفح بالوصول للميكروفون وأن التفريغ النصي عمل بشكل صحيح.",
      pronunciation_notes_ar: "",
    });
  }

  const system = `أنت مصحّح رسمي معتمد لاختبار التعبير الشفهي في TCF Canada. لديك التفريغ
النصي التلقائي لإجابة المتعلم الصوتية (وليس الصوت نفسه)، لذا قيّم بناءً على المحتوى اللغوي:
الطلاقة الظاهرة من بنية الجمل، ثراء المفردات، صحة القواعد، ومدى ملاءمة الإجابة للمهمة المطلوبة.
أجب حصرًا بكائن JSON صالح بالمخطط:
{
  "score_20": رقم من 0 إلى 20,
  "clb_estimate": رقم تقديري لمستوى CLB,
  "feedback_ar": "تقييم عام بالعربية",
  "pronunciation_notes_ar": "ملاحظات عامة محتملة حول النطق بناءً على الأخطاء الشائعة الظاهرة في التفريغ النصي (وضّح أنها تقديرية بما أنك لا تسمع الصوت مباشرة)"
}`;

  const userMsg = `المهمة المطلوبة: "${prompt}"\n\nالتفريغ النصي لإجابة المتعلم الشفهية:\n"""${transcript}"""\n\nمستوى المتعلم المستهدف: CLB ${targetClb}.`;

  try {
    const raw = await askClaude({ system, user: userMsg, maxTokens: 1500 });
    const result = extractJson(raw);
    return withCors(result);
  } catch (e) {
    return withCors({ error: String(e) }, 500);
  }
});
