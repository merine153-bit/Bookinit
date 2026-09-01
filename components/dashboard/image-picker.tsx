"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { IMAGE_LIBRARY, imagePath } from "@/lib/image-library";
import { cn } from "@/lib/utils";

/**
 * اختيار صورة من المكتبة المرفقة أو عبر رابط مباشر.
 * عند تفعيل Supabase Storage يمكن استبدال هذا المكوّن برفع ملفات فعلي.
 */
export function ImagePicker({
  name,
  defaultValue = "",
  label = "صورة",
  aspect = "aspect-[16/10]",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  aspect?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [urlDraft, setUrlDraft] = React.useState("");

  return (
    <div className="flex flex-col gap-2">
      <span className="font-body text-label-md text-on-surface">{label}</span>
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={value ? `تغيير ${label}` : `اختيار ${label}`}
        className={cn(
          "relative w-full rounded-xl overflow-hidden border border-dashed border-outline-variant/60 bg-surface-container-low transition-colors hover:border-primary",
          aspect,
        )}
      >
        {value ? (
          <Image src={value} alt="" fill sizes="480px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
            <ImagePlus className="size-8" aria-hidden />
            <span className="font-body text-label-md">اختر صورة</span>
          </span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="اختر صورة" variant="drawer">
        <div className="flex gap-2 mb-stack-lg">
          <Input
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            placeholder="أو الصق رابط صورة…"
            dir="ltr"
            aria-label="رابط صورة"
          />
          <Button
            onClick={() => {
              if (!urlDraft.trim()) return;
              setValue(urlDraft.trim());
              setUrlDraft("");
              setOpen(false);
            }}
          >
            استخدام
          </Button>
        </div>

        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {IMAGE_LIBRARY.map((image) => {
            const path = imagePath(image);
            const selected = value === path;
            return (
              <li key={image}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setValue(path);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative block w-full aspect-square rounded-lg overflow-hidden transition-all",
                    selected ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80",
                  )}
                >
                  <Image src={path} alt={image} fill sizes="120px" className="object-cover" />
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
