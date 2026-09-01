"use client";

import * as React from "react";
import { useActionState } from "react";
import { Field, Input, TagPicker, Textarea } from "@/components/ui/field";
import { updateRestaurantAction, type ActionResult } from "@/app/actions/dashboard";
import type { Restaurant } from "@/types";
import { ImagePicker } from "./image-picker";
import { FormMessage, SubmitButton } from "./form-status";

const TAG_OPTIONS = [
  "قهوة مختصة",
  "جلسات خارجية",
  "مناسب للعائلات",
  "عمل ودراسة",
  "إفطار",
  "عشاء",
  "نباتي",
  "توصيل",
  "حجز مسبق",
  "موسيقى هادئة",
];

/** نموذج إعدادات المطعم: الهوية، الوصف، الموقع، وبيانات التواصل. */
export function SettingsForm({ restaurant }: { restaurant: Restaurant }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateRestaurantAction,
    null,
  );
  const [tags, setTags] = React.useState<string[]>(restaurant.tags);

  return (
    <form action={formAction} className="flex flex-col gap-gutter max-w-3xl">
      <div className="grid md:grid-cols-[2fr_1fr] gap-gutter">
        <ImagePicker name="coverUrl" defaultValue={restaurant.coverUrl} label="صورة الغلاف" />
        <ImagePicker
          name="logoUrl"
          defaultValue={restaurant.logoUrl}
          label="شعار المطعم"
          aspect="aspect-square"
        />
      </div>

      <Field label="اسم المطعم" htmlFor="name">
        <Input id="name" name="name" defaultValue={restaurant.name} required />
      </Field>

      <Field label="وصف مختصر" htmlFor="shortDescription" hint="يظهر في بطاقات البحث والخريطة.">
        <Input
          id="shortDescription"
          name="shortDescription"
          defaultValue={restaurant.shortDescription}
          required
          maxLength={120}
        />
      </Field>

      <Field label="الوصف الكامل" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={restaurant.description} required />
      </Field>

      <div className="grid md:grid-cols-2 gap-gutter">
        <Field label="العنوان" htmlFor="address">
          <Input id="address" name="address" defaultValue={restaurant.address} required />
        </Field>
        <Field label="المدينة" htmlFor="city">
          <Input id="city" name="city" defaultValue={restaurant.city} required />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-gutter">
        <Field label="خط العرض" htmlFor="latitude" hint="إحداثيات موقع المطعم على الخريطة.">
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="0.0001"
            dir="ltr"
            defaultValue={restaurant.latitude}
            required
          />
        </Field>
        <Field label="خط الطول" htmlFor="longitude">
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="0.0001"
            dir="ltr"
            defaultValue={restaurant.longitude}
            required
          />
        </Field>
      </div>

      <Field label="رقم التواصل" htmlFor="phone">
        <Input id="phone" name="phone" dir="ltr" defaultValue={restaurant.phone ?? ""} />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="font-body text-label-md text-on-surface">مميزات المكان</span>
        <TagPicker options={TAG_OPTIONS} value={tags} onChange={setTags} name="tags" />
      </div>

      <FormMessage state={state} />
      <SubmitButton size="lg" className="self-start">
        حفظ الإعدادات
      </SubmitButton>
    </form>
  );
}
