"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { cn, timeAgo } from "@/lib/utils";
import type { Restaurant, Story } from "@/types";

const STORY_DURATION_MS = 6000;

interface StoryViewerProps {
  stories: Story[];
  restaurants: Record<string, Restaurant>;
  startIndex: number;
}

/** عارض القصص بملء الشاشة: شريط تقدم، تنقل بالنقر أو لوحة المفاتيح، وإيقاف مؤقت. */
export function StoryViewer({ stories, restaurants, startIndex }: StoryViewerProps) {
  const router = useRouter();
  const { markStorySeen } = useAppState();
  const [index, setIndex] = React.useState(startIndex);
  const [progress, setProgress] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const story = stories[index];
  const restaurant = story ? restaurants[story.restaurantId] : undefined;

  const close = React.useCallback(() => router.back(), [router]);

  const goNext = React.useCallback(() => {
    setProgress(0);
    setIndex((current) => {
      if (current + 1 >= stories.length) {
        router.push("/");
        return current;
      }
      return current + 1;
    });
  }, [stories.length, router]);

  const goPrev = React.useCallback(() => {
    setProgress(0);
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  React.useEffect(() => {
    if (story) markStorySeen(story.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  React.useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const ratio = Math.min(1, (Date.now() - started) / STORY_DURATION_MS);
      setProgress(ratio);
      if (ratio >= 1) goNext();
    }, 50);
    return () => window.clearInterval(timer);
  }, [index, paused, goNext]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      // في الواجهة العربية: السهم الأيسر يتقدّم، والأيمن يرجع.
      if (event.key === "ArrowLeft") goNext();
      if (event.key === "ArrowRight") goPrev();
      if (event.key === " ") {
        event.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, goNext, goPrev]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-inverse-surface flex items-center justify-center animate-[scale-in_220ms_ease-out]">
      <div className="relative w-full h-full max-w-[520px] max-h-dvh overflow-hidden bg-black">
        <Image
          key={story.id}
          src={story.imageUrl}
          alt={story.caption}
          fill
          priority
          sizes="(max-width: 520px) 100vw, 520px"
          className="object-cover animate-[scale-in_320ms_ease-out]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" aria-hidden />

        {/* شريط التقدم */}
        <div className="absolute top-3 inset-x-3 flex gap-1.5">
          {stories.map((item, i) => (
            <span key={item.id} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
              <span
                className="block h-full bg-white transition-[width] duration-100 ease-linear"
                style={{ width: `${i < index ? 100 : i === index ? progress * 100 : 0}%` }}
              />
            </span>
          ))}
        </div>

        {/* رأس القصة */}
        <div className="absolute top-7 inset-x-3 flex items-center justify-between gap-3 pt-2">
          <Link
            href={restaurant ? `/restaurant/${restaurant.slug}` : "/"}
            className="flex items-center gap-3 min-w-0"
          >
            {restaurant && (
              <Image
                src={restaurant.logoUrl}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover border-2 border-white/70"
              />
            )}
            <span className="min-w-0">
              <span className="block font-body text-label-md text-white truncate">
                {restaurant?.name ?? story.title}
              </span>
              <span className="block font-body text-label-sm text-white/70">
                {timeAgo(story.createdAt)}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "متابعة" : "إيقاف مؤقت"}
              className="size-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors"
            >
              {paused ? <Play className="size-5" aria-hidden /> : <Pause className="size-5" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="إغلاق القصة"
              className="size-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors"
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>
        </div>

        {/* مناطق التنقل بالنقر */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="القصة السابقة"
          disabled={index === 0}
          className="absolute inset-y-16 start-0 w-1/3 group disabled:cursor-default"
        >
          <ChevronRight
            className={cn(
              "size-8 text-white/0 group-hover:text-white/80 transition-colors absolute start-3 top-1/2 -translate-y-1/2",
              index === 0 && "hidden",
            )}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="القصة التالية"
          className="absolute inset-y-16 end-0 w-1/3 group"
        >
          <ChevronLeft
            className="size-8 text-white/0 group-hover:text-white/80 transition-colors absolute end-3 top-1/2 -translate-y-1/2"
            aria-hidden
          />
        </button>

        {/* تذييل القصة */}
        <div className="absolute bottom-0 inset-x-0 p-container-margin pb-8 flex flex-col gap-stack-md">
          <p className="font-body text-body-lg text-white text-balance">{story.caption}</p>
          {restaurant && (
            <Link
              href={`/restaurant/${restaurant.slug}/menu`}
              className="inline-flex items-center justify-center w-full py-4 rounded-lg bg-primary text-on-primary font-body text-label-md hover:bg-primary/90 transition-colors"
            >
              استكشف القائمة
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
