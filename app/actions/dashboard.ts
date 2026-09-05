"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManageRestaurants, getCurrentUser, getOwnedRestaurantId } from "@/lib/auth";
import { RESTAURANT_CATEGORIES } from "@/lib/constants";
import type { RestaurantCategory } from "@/types";
import {
  createMenuCategory,
  createMenuItem,
  createPost,
  createStory,
  deleteMenuItem,
  deletePost,
  deleteStory,
  getMenuItem,
  listMenuItems,
  moveMenuItem,
  updateMenuItem,
  updateRestaurant,
} from "@/lib/data/repository";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** يتحقق من أن المستخدم الحالي صاحب مطعم ويعيد معرّف مطعمه. */
async function requireOwnedRestaurant(): Promise<string> {
  const user = await getCurrentUser();
  if (!canManageRestaurants(user)) {
    throw new Error("لا تملك صلاحية إدارة محتوى المطاعم.");
  }
  const restaurantId = await getOwnedRestaurantId(user);
  if (!restaurantId) throw new Error("لا يوجد مطعم مرتبط بحسابك.");
  return restaurantId;
}

/** يتأكد أن العنصر يخص مطعم المستخدم قبل تعديله أو حذفه. */
async function requireOwnedItem(itemId: string, restaurantId: string) {
  const item = await getMenuItem(itemId);
  if (!item || item.restaurantId !== restaurantId) {
    throw new Error("هذا الصنف لا يتبع مطعمك.");
  }
  return item;
}

function refreshDashboard(restaurantSlugPaths: string[] = []) {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/");
  for (const path of restaurantSlugPaths) revalidatePath(path);
}

const menuItemSchema = z.object({
  categoryId: z.string().min(1, "اختر قسماً"),
  name: z.string().min(2, "اسم الصنف مطلوب"),
  description: z.string().min(5, "أضف وصفاً مختصراً"),
  price: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
  currency: z.string().min(1),
  imageUrl: z.string().min(1, "اختر صورة للصنف"),
  isAvailable: z.boolean(),
  tags: z.array(z.string()),
});

function parseMenuItemForm(formData: FormData) {
  return menuItemSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    currency: formData.get("currency") || "ر.س",
    imageUrl: formData.get("imageUrl"),
    isAvailable: formData.get("isAvailable") !== "false",
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  });
}

export async function createMenuItemAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const restaurantId = await requireOwnedRestaurant();
    const parsed = parseMenuItemForm(formData);
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من الحقول المدخلة." };
    }

    const existing = await listMenuItems(restaurantId);
    await createMenuItem({ ...parsed.data, restaurantId, sortOrder: existing.length });
    refreshDashboard();
    return { ok: true, message: "تمت إضافة الصنف إلى القائمة." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "تعذّر حفظ الصنف." };
  }
}

export async function updateMenuItemAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const restaurantId = await requireOwnedRestaurant();
    const id = String(formData.get("id") ?? "");
    await requireOwnedItem(id, restaurantId);

    const parsed = parseMenuItemForm(formData);
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من الحقول المدخلة." };
    }

    await updateMenuItem(id, parsed.data);
    refreshDashboard();
    return { ok: true, message: "تم تحديث الصنف." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "تعذّر تحديث الصنف." };
  }
}

export async function deleteMenuItemAction(formData: FormData): Promise<void> {
  const restaurantId = await requireOwnedRestaurant();
  const id = String(formData.get("id") ?? "");
  await requireOwnedItem(id, restaurantId);
  await deleteMenuItem(id);
  refreshDashboard();
}

export async function moveMenuItemAction(formData: FormData): Promise<void> {
  const restaurantId = await requireOwnedRestaurant();
  const id = String(formData.get("id") ?? "");
  const direction = Number(formData.get("direction")) === -1 ? -1 : 1;
  await requireOwnedItem(id, restaurantId);
  await moveMenuItem(id, direction);
  refreshDashboard();
}

export async function createCategoryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const restaurantId = await requireOwnedRestaurant();
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2) return { ok: false, message: "اسم القسم قصير جداً." };

    await createMenuCategory(restaurantId, name);
    refreshDashboard();
    return { ok: true, message: `تمت إضافة قسم «${name}».` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "تعذّر إضافة القسم." };
  }
}

const storySchema = z.object({
  title: z.string().min(2, "عنوان القصة مطلوب"),
  caption: z.string().min(3, "أضف نصاً قصيراً للقصة"),
  imageUrl: z.string().min(1, "اختر صورة للقصة"),
});

export async function createStoryAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const restaurantId = await requireOwnedRestaurant();
    const parsed = storySchema.safeParse({
      title: formData.get("title"),
      caption: formData.get("caption"),
      imageUrl: formData.get("imageUrl"),
    });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من الحقول المدخلة." };
    }

    await createStory({ ...parsed.data, restaurantId });
    refreshDashboard();
    return { ok: true, message: "تم نشر القصة — ستبقى ظاهرة 24 ساعة." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "تعذّر نشر القصة." };
  }
}

export async function deleteStoryAction(formData: FormData): Promise<void> {
  await requireOwnedRestaurant();
  await deleteStory(String(formData.get("id") ?? ""));
  refreshDashboard();
}

const postSchema = z.object({
  caption: z.string().min(5, "اكتب نص المنشور"),
  imageUrl: z.string().min(1, "اختر صورة للمنشور"),
  badge: z.string().nullable(),
  badgeTone: z.enum(["new", "popular"]),
});

export async function createPostAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const restaurantId = await requireOwnedRestaurant();
    const badge = String(formData.get("badge") ?? "").trim();
    const parsed = postSchema.safeParse({
      caption: formData.get("caption"),
      imageUrl: formData.get("imageUrl"),
      badge: badge || null,
      badgeTone: formData.get("badgeTone") === "popular" ? "popular" : "new",
    });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من الحقول المدخلة." };
    }

    await createPost({ ...parsed.data, restaurantId });
    refreshDashboard();
    return { ok: true, message: "تم نشر التحديث." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "تعذّر نشر التحديث." };
  }
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireOwnedRestaurant();
  await deletePost(String(formData.get("id") ?? ""));
  refreshDashboard();
}

const settingsSchema = z.object({
  name: z.string().min(2, "اسم المطعم مطلوب"),
  category: z.enum(RESTAURANT_CATEGORIES as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "اختر فئة صحيحة" }),
  }),
  description: z.string().min(10, "أضف وصفاً للمطعم"),
  shortDescription: z.string().min(5, "أضف وصفاً مختصراً"),
  address: z.string().min(3, "العنوان مطلوب"),
  city: z.string().min(2, "المدينة مطلوبة"),
  phone: z.string().nullable(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  logoUrl: z.string().min(1),
  coverUrl: z.string().min(1),
  tags: z.array(z.string()),
});

export async function updateRestaurantAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const restaurantId = await requireOwnedRestaurant();
    const phone = String(formData.get("phone") ?? "").trim();
    const parsed = settingsSchema.safeParse({
      name: formData.get("name"),
      category: formData.get("category"),
      description: formData.get("description"),
      shortDescription: formData.get("shortDescription"),
      address: formData.get("address"),
      city: formData.get("city"),
      phone: phone || null,
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      logoUrl: formData.get("logoUrl"),
      coverUrl: formData.get("coverUrl"),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من الحقول المدخلة." };
    }

    await updateRestaurant(restaurantId, {
      ...parsed.data,
      category: parsed.data.category as RestaurantCategory,
    });
    refreshDashboard();
    return { ok: true, message: "تم حفظ إعدادات المطعم." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "تعذّر حفظ الإعدادات." };
  }
}
