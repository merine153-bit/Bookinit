"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { createStoryAction, type ActionResult } from "@/app/actions/dashboard";
import { ImagePicker } from "./image-picker";
import { FormMessage, SubmitButton } from "./form-status";

/** نموذج نشر قصة جديدة (تبقى 24 ساعة). */
export function StoryForm({ defaultTitle }: { defaultTitle: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createStoryAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-gutter max-w-2xl">
      <ImagePicker name="imageUrl" label="صورة القصة" aspect="aspect-[9/16] max-h-96 mx-auto" />

      <Field label="عنوان القصة" htmlFor="story-title">
        <Input id="story-title" name="title" defaultValue={defaultTitle} required maxLength={40} />
      </Field>

      <Field label="نص القصة" htmlFor="story-caption" hint="جملة قصيرة تظهر أسفل الصورة.">
        <Textarea id="story-caption" name="caption" rows={3} required maxLength={160} />
      </Field>

      <FormMessage state={state} />
      <SubmitButton size="lg">نشر القصة</SubmitButton>
    </form>
  );
}
