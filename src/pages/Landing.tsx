import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Bot,
  Database,
  Mic,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import PublicNavbar from "../components/layout/PublicNavbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import { PLAN_OPTIONS } from "../data/plans";

const features = [
  {
    icon: ClipboardCheck,
    title: "محاكاة اختبارات رسمية",
    desc: "تدرّب على بيئة الاختبار الحقيقية بنفس التوقيت وشكل الأسئلة الرسمي لـ TCF Canada.",
  },
  {
    icon: Bot,
    title: "مدرّس ذكاء اصطناعي خاص",
    desc: "احصل على تقييم فوري وتوجيه شخصي لمحادثاتك وكتاباتك بفضل تقنيات الذكاء الاصطناعي المتقدمة.",
  },
  {
    icon: Database,
    title: "بنك أسئلة متجدد",
    desc: "آلاف الأسئلة الحصرية مع خوارزمية تمنع التكرار لضمان تغطية شاملة للمنهج.",
  },
  {
    icon: Mic,
    title: "تدريب صوتي متقدم",
    desc: "سجّل إجاباتك الشفهية وقارن نطقك مع النموذج الكيبيكي الأصيل.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="order-2 md:order-1">
          <h1 className="mb-5 text-4xl font-extrabold leading-tight text-brand-950 md:text-5xl">
            أتقن الفرنسية الكيبيكية واجتز <span className="text-accent-600">TCF Canada</span> بثقة
          </h1>
          <p className="mb-8 max-w-xl text-lg text-brand-600">
            منصة تعليمية متكاملة مدعومة بالذكاء الاصطناعي، مصادر رسمية، وخطط دراسية
            مخصصة لضمان نجاحك في اختبار تقييم اللغة الفرنسية.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/signup">
              <Button size="lg">ابدأ الآن مجانًا</Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary">
                اكتشف المزيد
              </Button>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-semibold text-brand-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> بدون بطاقة ائتمان</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> محتوى محدّث باستمرار</span>
          </div>
        </div>
        <div className="order-1 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 md:order-2">
          <div className="flex h-full w-full items-center justify-center">
            <div className="grid grid-cols-2 gap-4 p-10">
              {["🎧", "📝", "🗣️", "📖"].map((emoji, i) => (
                <div
                  key={i}
                  className="card flex h-24 w-24 items-center justify-center text-4xl md:h-28 md:w-28"
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-extrabold text-brand-950">ميزات المنصة الرئيسية</h2>
            <p className="text-brand-500">أدوات متطورة مصممة خصيصًا لتسريع عملية تعلمك وتعزيز فرص نجاحك.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="card card-hover flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white">
                  <f.icon size={22} />
                </div>
                <div>
                  <h3 className="mb-1 font-extrabold text-brand-950">{f.title}</h3>
                  <p className="text-sm text-brand-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-extrabold text-brand-950">خطط دراسية تناسب أهدافك</h2>
            <p className="text-brand-500">اختر الباقة الأنسب للوقت المتبقي لاختبارك.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {PLAN_OPTIONS.map((plan) => (
              <div
                key={plan.months}
                className={`card relative flex flex-col p-6 ${plan.highlighted ? "border-2 border-brand-700" : ""}`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-brand-800 px-3 py-1 text-xs font-bold text-white">
                    الأكثر شعبية
                  </span>
                )}
                <p className="text-2xl font-extrabold text-brand-950">{plan.label}</p>
                <p className="mb-4 text-sm text-brand-500">{plan.subtitle}</p>
                <ul className="mb-6 flex-1 space-y-2 text-sm text-brand-700">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500" /> {perk}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button fullWidth variant={plan.highlighted ? "primary" : "secondary"} size="sm">
                    اختيار الخطة
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="card flex flex-col items-center gap-4 bg-brand-950 p-10 text-center text-white md:flex-row md:justify-between md:text-start">
          <div>
            <h3 className="text-2xl font-extrabold">جاهز لبدء رحلتك؟</h3>
            <p className="text-brand-200">انضم إلى آلاف المتعلمين المستعدين للنجاح في TCF Canada.</p>
          </div>
          <Link to="/signup">
            <Button variant="gold" size="lg" icon={<ArrowLeft size={18} />}>
              ابدأ مجانًا
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
