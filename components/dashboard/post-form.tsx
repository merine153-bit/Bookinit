"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createPostAction, type ActionResult } from "@/app/actions/dashboard";
import { ImagePicker } from "./image-picker";
import { FormMessage, SubmitButton } from "./form-status";

/** نموذج نشر تحديث في التغذية الاجتماعية. */
export function PostForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createPostAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-gutter max-w-2xl">
      <ImagePicker name="imageUrl" label="صورة المنشور" aspect="aspect-[4/5] max-h-96 mx-auto" />

      <Field label="نص المنشور" htmlFor="caption">
        <Textarea id="caption" name="caption" rows={4} required maxLength={280} />
      </Field>

      <div className="grid grid-cols-2 gap-gutter">
        <Field label="شارة (اختياري)" htmlFor="badge" hint="مثل: جديد">
          <Input id="badge" name="badge" maxLength={20} />
        </Field>
        <Field label="نوع الشارة" htmlFor="badgeTone">
          <Select id="badgeTone" name="badgeTone" defaultValue="new">
            <option value="new">جديد (أخضر)</option>
            <option value="popular">الأكثر مبيعاً (محايد)</option>
          </Select>
        </Field>
      </div>

      <FormMessage state={state} />
      <SubmitButton size="lg">نشر التحديث</SubmitButton>
    </form>
  );
}
