import { corsHeaders, withCors } from "../_shared/cors.ts";
import { askAI, extractJson } from "../_shared/ai.ts";
import { getRequestUser, serviceClient } from "../_shared/authUser.ts";

const SKILL_LABELS: Record<string, string> = {
  comprehension_orale: "Compréhension Orale (فهم المسموع)",
  comprehension_ecrite: "Compréhension Écrite (فهم المقروء)",
  expression_ecrite: "Expression Écrite (التعبير الكتابي)",
  expression_orale: "Expression Orale (التعبير الشفهي)",
  grammaire_lexique: "Grammaire et Lexique (القواعد والمفردات)",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const user = await getRequestUser(req);
  if (!user) return withCors({ error: "غير مصرح" }, 401);

  const { skillArea, weakTags = [], targetClb = 7 } = await req.json();
  const skillLabel = SKILL_LABELS[skillArea] ?? skillArea;

  const system = `أنت مدرّس فرنسية كيبيكية خبير في التحضير لامتحان TCF Canada، تصمم دروسًا
تفاعلية قصيرة للناطقين بالعربية. اعتمد على أسلوب اللغة الفرنسية المستخدمة في كيبيك (المفردات
والتعابير الكيبيكية عند الاقتضاء) وعلى شكل أسئلة TCF Canada الرسمي. أجب حصرًا بكائن JSON صالح
بدون أي نص إضافي، بالمخطط التالي:
{
  "title": "عنوان الدرس بالفرنسية",
  "title_ar": "عنوان الدرس بالعربية",
  "explanation_ar": "شرح قاعدة أو مفهوم الدرس بالعربية في 3-5 أسطر",
  "exercises": [
    {
      "id": "معرف فريد قصير",
      "skill_area": "${skillArea}",
      "section": "orale|ecrite|grammaire",
      "difficulty_clb": رقم من 3 إلى 10,
      "type": "mcq",
      "prompt": "نص السؤال بالفرنسية",
      "passage": "نص أو حوار قصير إن لزم (اختياري)",
      "options": [{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],
      "correct_option_id": "a",
      "explanation": "شرح الإجابة الصحيحة بالعربية"
    }
  ]
}`;

  const userMsg = `أنشئ درسًا في مهارة "${skillLabel}" لمتعلم يستهدف مستوى CLB ${targetClb}.
${weakTags.length ? `ركّز خصوصًا على النقاط التالية التي يواجه فيها المتعلم صعوبة: ${weakTags.join(", ")}.` : ""}
أنشئ 5 تمارين متنوعة الصعوبة تدريجيًا.`;

  try {
    const raw = await askAI({ system, user: userMsg, maxTokens: 8192 });
    const lesson = extractJson<{
      title: string;
      title_ar: string;
      explanation_ar: string;
      exercises: Record<string, unknown>[];
    }>(raw);

    // خزّن التمارين في بنك الأسئلة العام ليستفيد منها التطبيق لاحقًا
    const db = serviceClient();
    if (lesson.exercises?.length) {
      await db.from("question_bank").insert(
        lesson.exercises.map((ex) => ({ ...ex, created_by: "ai" }))
      );
    }

    return withCors(lesson);
  } catch (e) {
    return withCors({ error: String(e) }, 500);
  }
});
