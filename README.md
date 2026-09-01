# Eatit — منصة اكتشاف المطاعم والمقاهي

<div dir="rtl">

تطبيق ويب عربي بالكامل (RTL) لاكتشاف المطاعم والمقاهي: تغذية اجتماعية للأطباق،
خريطة تفاعلية، قوائم رقمية، قصص المطاعم، ولوحة تحكم لأصحاب المطاعم.

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

---

## ربط Supabase

1. أنشئ مشروعاً على [supabase.com](https://supabase.com).
2. انسخ `.env.example` إلى `.env.local` واملأ:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

3. نفّذ الملفات التالية في SQL Editor بالترتيب:

   | الملف | المحتوى |
   | --- | --- |
   | `supabase/migrations/0001_init.sql` | الجداول والفهارس والمحفّزات |
   | `supabase/migrations/0002_rls.sql` | سياسات أمان الصفوف (RLS) |
   | `supabase/seed.sql` | البيانات التجريبية العربية |

4. أنشئ حساب صاحب المطعم من صفحة `/login`، ثم اربطه بمطعمه:

   ```sql
   update public.users set role = 'RESTAURANT_OWNER' where id = '<auth-user-id>';
   update public.restaurants set owner_id = '<auth-user-id>' where slug = 'maqha-alnoor';
   ```

5. لتفعيل الدخول عبر Google: فعّل مزوّد Google في
   *Authentication → Providers* وأضف `https://<domain>/auth/callback` إلى روابط العودة.

بمجرد وجود المتغيرات، تتحول كل استعلامات التطبيق تلقائياً إلى Supabase — لا يوجد
كود يحتاج التعديل (انظر `lib/data/repository.ts`).

---

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
supabase/      الهجرات والبيانات التجريبية
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

- **الصور:** كل الصور محلية داخل `public/images` (90 صورة)، فلا توجد روابط
  خارجية قد تنكسر. عند تفعيل Supabase Storage يمكن استبدال `ImagePicker`
  برفع ملفات فعلي.
- **الإعجاب والحفظ والمتابعة:** تُحفظ في `localStorage` لهذا المتصفح.
  الجداول المقابلة (`post_likes`, `saved_items`, `restaurant_followers`)
  جاهزة في المخطط للمزامنة مع الحساب.
- **الخريطة:** خريطة Leaflet حقيقية ببلاطات OpenStreetMap — قابلة للتحريك
  والتكبير، وعلاماتها بهوية Eatit.
- **الأمان:** مسارات `/dashboard` محمية عبر `middleware.ts`، وكل Server Action
  تتحقق من ملكية المطعم قبل التعديل، بالإضافة إلى سياسات RLS في قاعدة البيانات.

</div>
