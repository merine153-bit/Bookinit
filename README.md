# Eatit — منصة اكتشاف المطاعم والمقاهي

<div dir="rtl">

تطبيق ويب عربي بالكامل (RTL) لاكتشاف المطاعم والمقاهي: تغذية اجتماعية للأطباق،
خريطة تفاعلية، قوائم رقمية، قصص المطاعم، ولوحة تحكم لأصحاب المطاعم.

**النسخة الحية:** <https://eatit-app.netlify.app>

بُني اعتماداً على نظام تصميم **Eatit** المرفق ("Gourmet Minimalist") بألوانه وخطوطه
ومقاييسه الطباعية ومسافاته كما هي.

---

## التقنيات

| الطبقة | الأداة |
| --- | --- |
| الإطار | Next.js 15 (App Router) + React 19 |
| اللغة | TypeScript (وضع `strict`) |
| التنسيق | Tailwind CSS 4 (نظام تصميم عبر `@theme`) |
| الأيقونات | lucide-react |
| الخرائط | Leaflet + OpenStreetMap عبر react-leaflet |
| النماذج | React Hook Form + Zod |
| قاعدة البيانات والمصادقة | Supabase (PostgreSQL + Auth) |

---

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح <http://localhost:3000>.

> **وضع العرض التجريبي:** يعمل التطبيق كاملاً بدون أي إعداد.
> عندما لا تكون متغيرات Supabase موجودة، تُقرأ البيانات وتُكتب في مخزن محلي
> داخل الخادم مزوَّد ببيانات عربية واقعية (12 مطعماً، 45+ صنفاً، 21 منشوراً،
> 10 قصص، 22 تقييماً). كل أزرار الإضافة والتعديل والحذف تعمل فعلياً في هذا الوضع.

### الأوامر

| الأمر | الوظيفة |
| --- | --- |
| `npm run dev` | تشغيل بيئة التطوير |
| `npm run build` | بناء نسخة الإنتاج |
| `npm start` | تشغيل نسخة الإنتاج |
| `npm run lint` | فحص ESLint |
| `npm run typecheck` | فحص أنواع TypeScript |
| `npm run seed:generate` | توليد `supabase/seed.sql` من بيانات العرض |
| `npm run seed:push` | رفع بيانات العرض إلى مشروع Supabase مباشرة |

---

## ربط Supabase

1. أنشئ مشروعاً على [supabase.com](https://supabase.com).
2. **المخطط:** افتح *SQL Editor → New query*، والصق محتوى `supabase/setup.sql`
   كاملاً ثم شغّله. وهو تجميع للهجرات الأربع بالترتيب، آمن لإعادة التشغيل:

   | الهجرة | المحتوى |
   | --- | --- |
   | `0001_init` | الجداول والفهارس والمحفّزات |
   | `0002_rls` | سياسات أمان الصفوف |
   | `0003_rating_baseline` | فصل التقييمات التاريخية عن الحيّة |
   | `0004_private_schema_hardening` | نقل دوال `SECURITY DEFINER` خارج المخطط المعروض |
   | `0005_media_storage` | حاوية `media` وسياساتها لرفع صور المطاعم |
3. **البيانات:** ارفع البيانات التجريبية العربية عبر PostgREST:

   ```bash
   SUPABASE_URL=https://<ref>.supabase.co \
   SUPABASE_SECRET_KEY=sb_secret_... \
   npm run seed:push
   ```

   > المفتاح السري يُقرأ من البيئة لحظة التشغيل فقط، ولا يُحفظ في المستودع
   > ولا يصل إلى المتصفح. التطبيق نفسه لا يستخدم مفتاحاً سرياً إطلاقاً.

   بديل بلا سكربت: شغّل `supabase/seed.sql` في محرر SQL
   (يُولَّد من نفس البيانات عبر `npm run seed:generate`).

4. **متغيرات البيئة:** انسخ `.env.example` إلى `.env.local` واملأ:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   يدعم التطبيق صيغة المفاتيح الجديدة (`sb_publishable_…`) والقديمة
   (`anon` JWT) معاً عبر `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

5. **حساب صاحب المطعم:** ينشئ `npm run seed:push` الربط تلقائياً لحساب
   بريده `owner@eatit.app` إن وُجد. لربط حساب آخر:

   ```sql
   update public.users set role = 'RESTAURANT_OWNER' where id = '<auth-user-id>';
   update public.restaurants set owner_id = '<auth-user-id>' where slug = 'maqha-alnoor';
   ```

6. **الدخول عبر Google (اختياري):** فعّل المزوّد في
   *Authentication → Providers*، وأضف `https://<domain>/auth/callback` إلى
   روابط العودة، ثم اضبط `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`.
   بدون ذلك لا يظهر زر Google أصلاً — تفادياً لزر لا يعمل.

بمجرد وجود المتغيرات، تتحول كل استعلامات التطبيق تلقائياً إلى Supabase — لا يوجد
كود يحتاج التعديل (انظر `lib/data/repository.ts`).

## النشر على Netlify

المشروع منشور على <https://eatit-app.netlify.app> ومهيّأ عبر `netlify.toml`: أمر البناء، Node 22، إضافة Next.js
الرسمية، وترويسات التخزين المؤقت والأمان.

> ⚠️ **انتبه للفرع.** هذا المستودع يحوي أكثر من مشروع على فروع مختلفة،
> وفرعه الافتراضي ليس فرع Eatit. اختر الفرع الصحيح عند الربط.

1. **اربط المستودع:** Netlify → *Add new site* → *Import an existing project*
   → اختر المستودع.
2. **اختر الفرع:** *Branch to deploy* = `claude/eatit-web-app-r6zj7c`
3. **أضف متغيّرات البيئة** قبل أول بناء
   (*Site configuration → Environment variables*):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   > هذه متغيّرات **وقت البناء** لا وقت التشغيل. إضافتها بعد البناء لا تكفي —
   > لا بد من *Trigger deploy → Clear cache and deploy site*.
   >
   > وبدونها يعمل التطبيق في وضع العرض التجريبي المخزَّن في ذاكرة الخادم:
   > كل طلب قد يصل إلى نسخة مختلفة، فتظهر كتابات لوحة التحكم ثم تختفي.
   > **لا تنشر بدونهما.**

4. **حدّث عناوين Supabase** بعد معرفة النطاق:
   *Authentication → URL Configuration* → *Site URL* = نطاقك،
   و*Redirect URLs* أضف `https://<نطاقك>/auth/callback`.
   بدونها ستعيد روابط تأكيد البريد المستخدم إلى `localhost`.

### ملاحظات خاصة بـ Netlify

- **middleware** يعمل كدالة طرفية (Edge Function). `@supabase/ssr` متوافق معها،
  وحماية مسارات `/dashboard` تبقى فعّالة.
- **`next/image`** يمر عبر Netlify Image CDN تلقائياً. الصور محلية ومضغوطة
  مسبقاً (8.7 ميغابايت)، فالتحويلات قليلة.
- **الخطوط** تُنزَّل وقت البناء عبر `next/font`، فتُخدَّم من نطاقك لا من Google.

## بنية المشروع

```
app/
  page.tsx                     الصفحة الرئيسية (قصص + تغذية اجتماعية)
  discover/                    خريطة الاستكشاف التفاعلية
  search/                      البحث الشامل
  saved/                       المحفوظات
  profile/                     الملف الشخصي
  login/                       تسجيل الدخول / إنشاء حساب
  restaurant/[slug]/           ملف المطعم
  restaurant/[slug]/menu/      القائمة الرقمية الكاملة
  story/[id]/                  عارض القصص بملء الشاشة
  dashboard/                   لوحة تحكم صاحب المطعم
  actions/                     Server Actions (مصادقة + إدارة المحتوى)
  auth/callback/               تبادل رمز OAuth بجلسة

components/
  ui/         مكوّنات أساسية (Button, Card, Modal, Toast, Rating, …)
  layout/     الشريط العلوي والتنقل السفلي/العلوي
  home/       القصص وشريطها وعارضها والعمود الجانبي
  social/     بطاقة المنشور والإعجاب والحفظ والتعليقات
  discover/   الخريطة والعلامات والتصفية
  restaurant/ الغلاف والبطاقات والتقييمات
  menu/       بطاقات الأصناف وتبويبات الأقسام
  profile/    تبويبات الملف الشخصي والمحفوظات
  dashboard/  إطار اللوحة والنماذج والمؤشرات
  search/     واجهة البحث الحي

lib/
  data/demo.ts        البيانات التجريبية العربية
  data/store.ts       مخزن قابل للتعديل لوضع العرض التجريبي
  data/repository.ts  طبقة الوصول للبيانات (Supabase أو المخزن المحلي)
  data/mappers.ts     تحويل صفوف قاعدة البيانات إلى أنواع التطبيق
  supabase/           عملاء Supabase (متصفح/خادم/middleware)
  search.ts           منطق البحث المشترك بين الخادم والعميل
  utils.ts            التنسيق والوقت والمسافة وحالة العمل
  constants.ts        ثوابت التنقل والتصفية

hooks/         حالة الإعجاب والحفظ والمتابعة (تُحفظ محلياً)
types/         أنواع النطاق
supabase/      الهجرات وسياسات RLS والبيانات التجريبية
public/images/ صور الطعام والأماكن (محلية — لا روابط خارجية تنكسر)
```

---

## نظام التصميم

كل الرموز التصميمية معرّفة في `app/globals.css` داخل `@theme`، فتصبح متاحة
كأدوات Tailwind مباشرة (`bg-surface`, `text-on-surface-variant`,
`text-headline-md`, `px-container-margin`, `shadow-level-1` …).

| الرمز | القيمة |
| --- | --- |
| Primary | `#b3290f` |
| Primary container | `#ff5f40` |
| Secondary (Forest) | `#2e6767` |
| Secondary container | `#b1eae9` |
| Background | `#fcf9f8` |
| On surface | `#1b1c1c` |
| On surface variant | `#5a413b` |
| Outline | `#8e706a` |
| Error | `#ba1a1a` |
| نجوم التقييم | `#ffb800` |

**الخطوط:** Montserrat للعناوين و Be Vietnam Pro للنصوص، مع Cairo و
IBM Plex Sans Arabic كخطوط احتياطية داخل نفس العائلة لتغطية الحروف العربية —
فتظهر الكلمات اللاتينية والأرقام بخط العلامة، والنص العربي بخط عربي أنيق.

**المسافات:** نظام 8px — هامش جانبي 20px على الجوال، مزراب 16px،
ومسافة رأسية 24px بين البطاقات.

---

## ملاحظات

- **الصور:** بيانات العرض تستخدم 90 صورة محلية في `public/images` (مضغوطة،
  8.7 ميغابايت) فلا روابط خارجية تنكسر. وأصحاب المطاعم يرفعون صورهم من
  أجهزتهم إلى Supabase Storage.
- **رفع الصور من الجهاز:** متاح في نماذج القصص والأصناف والمنشورات
  والإعدادات. تُضغط الصورة في المتصفح (1600 بكسل، JPEG بجودة 0.82) ثم تُرفع
  مباشرة إلى حاوية `media` بجلسة المستخدم — فلا تمر بايتات الصورة عبر خادم
  التطبيق. المسار `media/<restaurant_id>/…`، وسياسات التخزين تتحقق من ملكية
  المطعم، فلا يكتب صاحب مطعم في مجلد غيره.
- **نوع المكان:** يُشتقّ من الفئة (`lib/venue.ts`) ويظهر كشارة «مقهى» أو
  «مطعم» في بطاقات المطاعم والغلاف وبطاقة الخريطة ولوحة التحكم. المصدر نفسه
  يغذّي تبويبَي التصفية وألوان علامات الخريطة، فلا يتناقض المعروض مع النتائج.
- **الإعجاب والحفظ والمتابعة:** تُحفظ في `localStorage` لهذا المتصفح.
  الجداول المقابلة (`post_likes`, `saved_items`, `restaurant_followers`)
  جاهزة في المخطط للمزامنة مع الحساب.
- **الخريطة:** خريطة Leaflet حقيقية بطبقتين — شوارع (OpenStreetMap) وأقمار
  صناعية (Esri World Imagery) — قابلة للتحريك والتكبير، وعلاماتها بهوية Eatit.
- **تحديد الموقع (GPS):** زر «موقعي» يبدأ تتبّعاً مستمراً عبر
  `navigator.geolocation.watchPosition`. عندها تُحسب المسافات من موقعك الفعلي
  بدل التقديرات المخزّنة، وتُرتّب نتائج الخريطة والبحث حسب القرب، وتظهر نقطة
  زرقاء بدائرة تبيّن هامش الدقة الذي يبلّغه الجهاز.
  **الموقع لا يُرسَل إلى الخادم إطلاقاً** — يبقى في المتصفح ويُستخدم للحساب
  محلياً فقط. يتطلب HTTPS (متوفّر على النطاق المنشور).
- **الأمان:** ثلاث طبقات — `middleware.ts` يحمي مسارات `/dashboard`، وكل Server
  Action تتحقق من ملكية المطعم قبل التعديل، وسياسات RLS تفرض العزل في القاعدة
  نفسها. دوال `SECURITY DEFINER` موضوعة في مخطط `private` غير المعروض عبر
  PostgREST، فلا يمكن استدعاؤها من الـ API.
- **المصادقة:** تُنفَّذ في Server Actions فتُكتب الجلسة في الكوكيز على الخادم
  مباشرة — لا تفاوت بين جلسة العميل والخادم، ويعمل خلف الشبكات المقيّدة.
- **بعد النشر:** فعّل *Leaked Password Protection* من
  *Authentication → Password settings* في لوحة Supabase.

</div>
