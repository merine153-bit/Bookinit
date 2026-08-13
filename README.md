# Passerelle TCF

منصة تعليمية تفاعلية باللغة العربية لتعلّم الفرنسية الكيبيكية والتحضير لامتحان
**TCF Canada**، مدعومة بوكيل ذكاء اصطناعي (Anthropic Claude) يولّد الدروس والأسئلة
ويصحّح إجابات التعبير الكتابي والشفهي، فوق بنية تحتية من Supabase (مصادقة، قاعدة
بيانات، تخزين).

## المكدس التقني

- **الواجهة**: React 19 + TypeScript + Vite + Tailwind CSS v4 (واجهة RTL بالكامل)
- **الخلفية/القاعدة**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **الذكاء الاصطناعي**: Anthropic Claude API (عبر Supabase Edge Functions، المفتاح لا يُكشف أبدًا في المتصفح)
- **الصوت**: MediaRecorder API للتسجيل، Web Speech API للتفريغ النصي الفوري، SpeechSynthesis لمحاكاة الاستماع

## البدء السريع (تطوير محلي)

```bash
npm install
cp .env.example .env.local   # ثم املأ القيم (انظر أدناه)
npm run dev
```

## إعداد Supabase (خطوة بخطوة)

### 1. بيانات الاتصال الأساسية

من **Project Settings > API** في لوحة تحكم Supabase، انسخ:

- `Project URL` → `VITE_SUPABASE_URL`
- `anon public key` → `VITE_SUPABASE_ANON_KEY`

ضعهما في `.env.local` (لا يُرفع هذا الملف إلى Git).

### 2. تطبيق مخطط قاعدة البيانات

افتح **SQL Editor** في لوحة تحكم Supabase → New query، ثم الصق محتوى الملف
[`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) بالكامل واضغط Run.

هذا الملف ينشئ:

- الجداول: `profiles`, `study_plans`, `lesson_progress`, `question_bank`, `exam_attempts`, `exam_answers`
- سياسات RLS تعزل بيانات كل مستخدم عن الآخرين
- Trigger لإنشاء صف `profiles` تلقائيًا عند التسجيل
- دالة `increment_points` لحساب النقاط وسلسلة الأيام المتتالية
- حاوية تخزين (`voice-recordings`) للتسجيلات الصوتية

### 3. تفعيل تسجيل الدخول عبر Gmail

في **Authentication > Providers > Google**: فعّل المزوّد وأضف Client ID/Secret من
[Google Cloud Console](https://console.cloud.google.com/apis/credentials) (نوع
"OAuth 2.0 Client ID" لتطبيق ويب)، مع رابط إعادة التوجيه المعروض في نفس الصفحة.

تأكيد البريد الإلكتروني عند التسجيل بكلمة مرور مفعّل افتراضيًا في Supabase Auth
(**Authentication > Providers > Email**).

### 4. نشر وكيل الذكاء الاصطناعي (Edge Functions)

يتطلب هذا الجزء [Supabase CLI](https://supabase.com/docs/guides/cli) مثبتًا على
جهازك (وليس بالضرورة من هذه البيئة السحابية):

```bash
supabase login
supabase link --project-ref <project-ref>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
supabase functions deploy generate-lesson
supabase functions deploy generate-exam
supabase functions deploy grade-writing
supabase functions deploy grade-speaking
supabase functions deploy tutor-chat
```

> متغيرات `SUPABASE_URL` و`SUPABASE_ANON_KEY` و`SUPABASE_SERVICE_ROLE_KEY` متوفرة
> تلقائيًا داخل بيئة Edge Functions من طرف Supabase، لا حاجة لضبطها يدويًا.

بدون هذه الخطوة، يعمل التطبيق بشكل كامل باستخدام بنك أسئلة محلي أساسي
(`src/data/sampleQuestions.ts`) مع رسالة توضيحية للمستخدم بأن ميزات الذكاء
الاصطناعي (توليد الدروس، تصحيح الكتابة/الكلام) غير مفعّلة بعد.

## ملاحظات مهمة حول الدقة

- **نظام التنقيط**: التحويل من النقاط الخام إلى مستوى CLB/NCLC (`src/lib/scoring.ts`)
  مبني على جداول التعادل الرسمية المنشورة من IRCC وFrance Éducation international،
  لكنه **تقريب تعليمي** وليس خوارزمية التصحيح السرية الفعلية لـ TCF Canada (المبنية
  على نظرية الاستجابة للمفردة IRT). مفيد جدًا للتدرّب، لكن لا يُعتمد كنتيجة رسمية.
- **الاستماع**: لا تتوفر تسجيلات صوتية رسمية محمية بحقوق الطبع، لذا تُقرأ النصوص
  عبر خاصية `SpeechSynthesis` في المتصفح (صوت فرنسي كندي `fr-CA`) كمحاكاة تدريبية.
- **تصحيح التعبير الشفهي**: يعتمد على التفريغ النصي التلقائي للكلام (Web Speech
  API) ثم تحليل النص بواسطة Claude، وليس تحليل الصوت مباشرة.

## البنية

```
src/
  components/   مكوّنات واجهة قابلة لإعادة الاستخدام (تخطيط، تمارين، عناصر UI)
  contexts/     AuthContext (جلسة Supabase + الملف الشخصي)
  data/         بيانات ثابتة: خطط الاشتراك، بنك أسئلة أساسي، إعدادات الامتحان
  hooks/        مؤقت الامتحان، تسجيل صوتي، تفريغ نصي
  lib/          عملاء Supabase/الذكاء الاصطناعي، محرك اختيار الأسئلة، محرك التنقيط
  pages/        صفحات التطبيق (هبوط، مصادقة، لوحة تحكم، دروس، امتحان، ملف شخصي)
supabase/
  migrations/   مخطط قاعدة البيانات SQL
  functions/    وكيل الذكاء الاصطناعي (Edge Functions بلغة Deno/TypeScript)
```
