"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select, TagPicker, Textarea } from "@/components/ui/field";
import { MENU_ITEM_TAGS } from "@/lib/constants";
import { createMenuItemAction, updateMenuItemAction, type ActionResult } from "@/app/actions/dashboard";
import type { MenuCategory, MenuItem } from "@/types";
import { ImagePicker } from "./image-picker";
import { FormMessage, SubmitButton } from "./form-status";

/** نموذج إضافة/تعديل صنف من القائمة. */
export function MenuItemForm({
  categories,
  restaurantId,
  item,
  defaultCurrency = "ر.س",
}: {
  categories: MenuCategory[];
  restaurantId: string;
  item?: MenuItem;
  defaultCurrency?: string;
}) {
  const router = useRouter();
  const action = item ? updateMenuItemAction : createMenuItemAction;
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);
  const [tags, setTags] = React.useState<string[]>(item?.tags ?? []);

  React.useEffect(() => {
    if (state?.ok) {
      router.refresh();
      if (!item) router.push("/dashboard/menu");
    }
  }, [state, item, router]);

  return (
    <form action={formAction} className="flex flex-col gap-gutter max-w-2xl">
      {item && <input type="hidden" name="id" value={item.id} />}

      <ImagePicker name="imageUrl" restaurantId={restaurantId} defaultValue={item?.imageUrl ?? ""} label="صورة الصنف" />

      <Field label="اسم الصنف" htmlFor="name">
        <Input id="name" name="name" defaultValue={item?.name} required maxLength={80} />
      </Field>

      <Field label="الوصف" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={item?.description} required />
      </Field>

      <div className="grid grid-cols-2 gap-gutter">
        <Field label="السعر" htmlFor="price">
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.5"
            dir="ltr"
            defaultValue={item?.price}
            required
          />
        </Field>
        <Field label="العملة" htmlFor="currency">
          <Select id="currency" name="currency" defaultValue={item?.currency ?? defaultCurrency}>
            <option value="ر.س">ر.س</option>
            <option value="$">$</option>
            <option value="د.إ">د.إ</option>
            <option value="ج.م">ج.م</option>
          </Select>
        </Field>
      </div>

      <Field label="القسم" htmlFor="categoryId">
        <Select id="categoryId" name="categoryId" defaultValue={item?.categoryId} required>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="الحالة" htmlFor="isAvailable">
        <Select
          id="isAvailable"
          name="isAvailable"
          defaultValue={item ? String(item.isAvailable) : "true"}
        >
          <option value="true">متوفر</option>
          <option value="false">غير متوفر حالياً</option>
        </Select>
      </Field>

      <div className="flex flex-col gap-2">
        <span className="font-body text-label-md text-on-surface">الوسوم</span>
        <TagPicker options={MENU_ITEM_TAGS} value={tags} onChange={setTags} name="tags" />
      </div>

      <FormMessage state={state} />

      <div className="flex gap-3 pt-2">
        <SubmitButton size="lg" className="flex-1">
          {item ? "حفظ التعديلات" : "إضافة الصنف"}
        </SubmitButton>
      </div>
    </form>
  );
}
