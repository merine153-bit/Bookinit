import Link from "next/link";
import { cn } from "@/lib/utils";

/** شعار Eatit النصي — يبقى بالإنجليزية كاسم تجاري. */
export function Brand({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Eatit — الصفحة الرئيسية"
      className={cn(
        "font-display font-bold text-primary tracking-tight text-headline-mobile md:text-headline-lg leading-none",
        className,
      )}
    >
      Eatit
    </Link>
  );
}
