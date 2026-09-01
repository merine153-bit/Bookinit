import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SearchClient } from "@/components/search/search-client";
import { RestaurantCardSkeleton } from "@/components/ui/skeleton";
import { listAllMenuItems, listRestaurants } from "@/lib/data/repository";

export const metadata = {
  title: "البحث",
  description: "ابحث عن مطعم أو مقهى أو طبق في Eatit.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, restaurants, items] = await Promise.all([
    searchParams,
    listRestaurants(),
    listAllMenuItems(),
  ]);

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-container-margin py-stack-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {Array.from({ length: 6 }, (_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <SearchClient restaurants={restaurants} items={items} initialQuery={q ?? ""} />
      </Suspense>
    </AppShell>
  );
}
