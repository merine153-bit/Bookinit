import { notFound } from "next/navigation";
import { StoryViewer } from "@/components/home/story-viewer";
import { listRestaurants, listStories } from "@/lib/data/repository";
import type { Restaurant } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const stories = await listStories();
  const story = stories.find((s) => s.id === id);
  return { title: story ? story.title : "القصة غير متاحة" };
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const [stories, restaurants] = await Promise.all([listStories(), listRestaurants()]);

  const startIndex = stories.findIndex((story) => story.id === id);
  if (startIndex === -1) notFound();

  const restaurantMap = restaurants.reduce<Record<string, Restaurant>>((acc, restaurant) => {
    acc[restaurant.id] = restaurant;
    return acc;
  }, {});

  return <StoryViewer stories={stories} restaurants={restaurantMap} startIndex={startIndex} />;
}
