import { AppShell } from "@/components/layout/app-shell";
import { DiscoverClient } from "@/components/discover/discover-client";
import { listRestaurants } from "@/lib/data/repository";

export const metadata = {
  title: "استكشف",
  description: "استكشف المطاعم والمقاهي القريبة منك على الخريطة.",
};

export default async function DiscoverPage() {
  const restaurants = await listRestaurants();

  return (
    <AppShell fullBleed>
      <h1 className="sr-only">استكشف المطاعم والمقاهي على الخريطة</h1>
      <DiscoverClient restaurants={restaurants} />
    </AppShell>
  );
}
