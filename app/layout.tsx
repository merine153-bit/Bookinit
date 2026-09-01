import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cairo, IBM_Plex_Sans_Arabic, Montserrat } from "next/font/google";
import { AppStateProvider } from "@/hooks/use-app-state";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

/* الخطوط اللاتينية للعلامة والأرقام… */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
  adjustFontFallback: false,
  fallback: [],
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-be-vietnam",
  display: "swap",
  adjustFontFallback: false,
  fallback: [],
});

/* …والخطوط العربية التي تلتقط الحروف العربية داخل نفس عائلة الخط. */
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eatit.app"),
  title: {
    default: "Eatit — اكتشف المطاعم والمقاهي من حولك",
    template: "%s · Eatit",
  },
  description:
    "Eatit منصة عربية لاكتشاف المطاعم والمقاهي: تصفّح القوائم الرقمية، تابع قصص المطاعم، واحفظ الأطباق التي تحبها.",
  applicationName: "Eatit",
  keywords: ["مطاعم", "مقاهي", "قوائم طعام", "الرياض", "اكتشاف مطاعم", "Eatit"],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    title: "Eatit — اكتشف المطاعم والمقاهي من حولك",
    description: "منصة عربية لاكتشاف المطاعم والمقاهي والقوائم الرقمية.",
    siteName: "Eatit",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcf9f8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${montserrat.variable} ${beVietnamPro.variable} ${cairo.variable} ${plexArabic.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary"
        >
          تخطَّ إلى المحتوى الرئيسي
        </a>
        <AppStateProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
