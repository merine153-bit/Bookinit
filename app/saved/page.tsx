import { AppShell } from "@/components/layout/app-shell";
import { SavedClient } from "@/components/profile/saved-client";
import { listAllMenuItems, listPosts, listRestaurants } from "@/lib/data/repository";

export const metadata = {
  title: "المحفوظات",
  description: "كل ما حفظته من مطاعم وأطباق ومنشورات في مكان واحد.",
};

export default async function SavedPage() {
  const [restaurants, items, posts] = await Promise.all([
    listRestaurants(),
    listAllMenuItems(),
    listPosts(),
  ]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col gap-stack-lg">
        <div>
          <h1 className="font-display text-headline-mobile md:text-headline-lg text-on-surface">
            المحفوظات
          </h1>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            العناصر التي حفظتها محفوظة على هذا المتصفح.
          </p>
        </div>
        <SavedClient restaurants={restaurants} items={items} posts={posts} />
      </div>
    </AppShell>
  );
}
