"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/types";

/** تبويبات أقسام القائمة — تلتصق أسفل الشريط العلوي وتتبع القسم الظاهر. */
export function MenuCategoryTabs({ categories }: { categories: MenuCategory[] }) {
  const [active, setActive] = React.useState(categories[0]?.id);
  const listRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(`category-${category.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace("category-", ""));
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  React.useEffect(() => {
    const button = listRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    button?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="أقسام القائمة"
      className="sticky top-[72px] z-[80] glass border-b border-outline-variant/30 overflow-x-auto hide-scrollbar"
    >
      <ul
        ref={listRef}
        className="flex items-center gap-8 w-max px-container-margin pt-4 max-w-7xl mx-auto"
      >
        {categories.map((category) => {
          const isActive = category.id === active;
          return (
            <li key={category.id}>
              <a
                data-tab={category.id}
                href={`#category-${category.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  document
                    .getElementById(`category-${category.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActive(category.id);
                }}
                className={cn(
                  "block font-body text-label-md pb-3 px-2 border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "text-primary border-primary"
                    : "text-on-surface-variant border-transparent hover:text-on-surface",
                )}
              >
                {category.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
