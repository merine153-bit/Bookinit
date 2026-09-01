import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";
import { canManageRestaurants, getCurrentUser } from "@/lib/auth";
import { demoUsers } from "@/lib/data/demo";
import {
  listAllMenuItems,
  listPosts,
  listRestaurants,
  listUserPosts,
  listUserReviews,
} from "@/lib/data/repository";
import { cn, formatNumber } from "@/lib/utils";

export const metadata = {
  title: "حسابي",
  description: "ملفك الشخصي في Eatit: منشوراتك ومحفوظاتك وتقييماتك.",
};

export default async function ProfilePage() {
  const signedIn = await getCurrentUser();
  // للضيوف نعرض ملفاً تجريبياً للمعاينة مع دعوة واضحة لتسجيل الدخول.
  const user = signedIn ?? demoUsers[0];

  const [posts, reviews, restaurants, items, allPosts] = await Promise.all([
    listUserPosts(user.id),
    listUserReviews(user.fullName),
    listRestaurants(),
    listAllMenuItems(),
    listPosts(),
  ]);

  const stats = [
    { label: "منشور", value: posts.length },
    { label: "متابِع", value: user.followersCount },
    { label: "يتابع", value: user.followingCount },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
        {!signedIn && (
          <Card className="p-gutter flex flex-col sm:flex-row sm:items-center gap-stack-md bg-secondary-container/40">
            <p className="font-body text-body-md text-on-secondary-container flex-1">
              أنت تتصفح كضيف — سجّل الدخول لحفظ محفوظاتك ومتابعاتك على كل أجهزتك.
            </p>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "forest", size: "md", pill: true }), "shrink-0")}
            >
              <LogIn className="size-5" aria-hidden />
              تسجيل الدخول
            </Link>
          </Card>
        )}

        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-stack-lg">
          <Image
            src={user.avatarUrl ?? "/images/u-1.jpg"}
            alt={`صورة ${user.fullName}`}
            width={128}
            height={128}
            className="size-28 md:size-32 rounded-full object-cover border-4 border-surface shadow-level-2 shrink-0"
          />
          <div className="flex-1 text-center sm:text-start min-w-0">
            <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
              {user.fullName}
            </h1>
            <p className="font-body text-label-md text-on-surface-variant mt-1" dir="ltr">
              {user.username}
            </p>
            {user.bio && (
              <p className="font-body text-body-md text-on-surface-variant mt-stack-md max-w-xl">
                {user.bio}
              </p>
            )}
            <ul className="flex items-center justify-center sm:justify-start gap-8 mt-stack-md">
              {stats.map((stat) => (
                <li key={stat.label} className="text-center sm:text-start">
                  <span className="numeric block font-display text-headline-md text-on-surface">
                    {formatNumber(stat.value)}
                  </span>
                  <span className="block font-body text-label-sm text-on-surface-variant">
                    {stat.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {signedIn && (
            <div className="flex flex-col gap-2 shrink-0">
              {canManageRestaurants(signedIn) && (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "forest", size: "md", pill: true }))}
                >
                  <LayoutDashboard className="size-5" aria-hidden />
                  لوحة التحكم
                </Link>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className={cn(buttonVariants({ variant: "outline", size: "md", pill: true }), "w-full")}
                >
                  <LogOut className="size-5" aria-hidden />
                  تسجيل الخروج
                </button>
              </form>
            </div>
          )}
        </header>

        <ProfileTabs
          posts={posts}
          reviews={reviews}
          restaurants={restaurants}
          items={items}
          allPosts={allPosts}
        />
      </div>
    </AppShell>
  );
}
