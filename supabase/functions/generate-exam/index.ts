import { corsHeaders, withCors } from "../_shared/cors.ts";
import { askAI, extractJson } from "../_shared/ai.ts";
import { getRequestUser, serviceClient } from "../_shared/authUser.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getRequestUser(req);
  if (!user) return withCors({ error: "غير مصرح" }, 401);

  const { sections = [], excludeIds = [], targetClb = 7, seed } = await req.json();

  const system = `أنت مصمم أسئلة رسمي لامتحان TCF Canada (فرنسية كيبيكية). مهمتك توليد دفعة
أسئلة جديدة تمامًا وغير مكررة في كل مرة (استخدم البذرة seed لتنويع السياقات والمواضيع)، بنفس
شكل وصعوبة الامتحان الرسمي. أجب حصرًا بمصفوفة JSON صالحة بدون أي نص إضافي، بعناصر بالمخطط:
{
  "id": "معرف فريد",
  "skill_area": "comprehension_orale|comprehension_ecrite|grammaire_lexique|expression_ecrite|expression_orale",
  "section": "orale|ecrite|grammaire|ecrite_expression|orale_expression",
  "difficulty_clb": رقم من 3 إلى 10,
  "type": "mcq" أو "open_written" أو "open_spoken",
  "prompt": "نص السؤال بالفرنسية",
  "passage": "نص أو حوار قصير عند الحاجة (اختياري)",
  "options": [{"id":"a","text":"..."}, ...] (فقط لأسئلة mcq),
  "correct_option_id": "a" (فقط لأسئلة mcq),
  "explanation": "شرح مختصر بالعربية"
}`;

  const userMsg = `ولّد أسئلة لهذه المهارات: ${sections.join(", ")}. مستوى الصعوبة المستهدف: CLB ${targetClb}.
بذرة التنويع (seed): ${seed}. تجنّب تكرار أفكار الأسئلة ذات المعرفات التالية إن أمكن: ${excludeIds.slice(0, 30).join(", ") || "لا يوجد"}.
ولّد سؤالين إلى ثلاثة لكل مهارة.`;

  try {
    const raw = await askAI({ system, user: userMsg, maxTokens: 6000 });
    const questions = extractJson<Record<string, unknown>[]>(raw);

    const db = serviceClient();
    if (questions?.length) {
      await db.from("question_bank").insert(
        questions.map((q) => ({ ...q, created_by: "ai" }))
      );
    }

    return withCors({ questions });
  } catch (e) {
    return withCors({ error: String(e) }, 500);
  }
});
