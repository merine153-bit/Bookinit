"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createCategoryAction, type ActionResult } from "@/app/actions/dashboard";
import { FormMessage, SubmitButton } from "./form-status";

/** إضافة قسم جديد إلى القائمة عبر نافذة منبثقة. */
export function CategoryForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createCategoryAction, null);

  React.useEffect(() => {
    if (state?.ok) {
      router.refresh();
      setOpen(false);
    }
  }, [state, router]);

  return (
    <>
      <Button variant="secondary" pill onClick={() => setOpen(true)}>
        <FolderPlus className="size-5" aria-hidden />
        إضافة قسم
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة قسم جديد" variant="drawer">
        <form action={formAction} className="flex flex-col gap-gutter">
          <Field label="اسم القسم" htmlFor="category-name" hint="مثل: أطباق رئيسية، مشروبات باردة">
            <Input id="category-name" name="name" data-autofocus required maxLength={40} />
          </Field>
          <FormMessage state={state} />
          <SubmitButton size="full">إضافة القسم</SubmitButton>
        </form>
      </Modal>
    </>
  );
}
