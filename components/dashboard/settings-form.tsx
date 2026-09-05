"use client";

import * as React from "react";
import { useActionState } from "react";
import { Field, Input, Select, TagPicker, Textarea } from "@/components/ui/field";
import { VenueTypeBadge } from "@/components/ui/venue-type-badge";
import { RESTAURANT_CATEGORIES } from "@/lib/constants";
import { venueTypeOf } from "@/lib/venue";
import { updateRestaurantAction, type ActionResult } from "@/app/actions/dashboard";
import type { Restaurant } from "@/types";
import { ImagePicker } from "./image-picker";
import { LocationPicker } from "./location-picker";
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
  const [category, setCategory] = React.useState<string>(restaurant.category);

  return (
    <form action={formAction} className="flex flex-col gap-gutter max-w-3xl">
      <div className="grid md:grid-cols-[2fr_1fr] gap-gutter">
        <ImagePicker
          name="coverUrl"
          restaurantId={restaurant.id}
          defaultValue={restaurant.coverUrl}
          label="صورة الغلاف"
        />
        <ImagePicker
          name="logoUrl"
          restaurantId={restaurant.id}
          defaultValue={restaurant.logoUrl}
          label="شعار المطعم"
          aspect="aspect-square"
        />
      </div>

      <Field label="اسم المطعم" htmlFor="name">
        <Input id="name" name="name" defaultValue={restaurant.name} required />
      </Field>

      <Field
        label="الفئة"
        htmlFor="category"
        hint={`يُصنَّف مكانك تلقائياً كـ«${venueTypeOf(category)}» بناءً على الفئة.`}
      >
        <div className="flex items-center gap-3">
          <Select
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="flex-1"
          >
            {RESTAURANT_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <VenueTypeBadge category={category} />
        </div>
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

      <LocationPicker
        latitude={restaurant.latitude}
        longitude={restaurant.longitude}
        address={restaurant.address}
      />

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
