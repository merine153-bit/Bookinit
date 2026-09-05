"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { IMAGE_LIBRARY, imagePath } from "@/lib/image-library";
import { ACCEPTED_TYPES } from "@/lib/image-compress";
import { useImageUpload } from "@/hooks/use-image-upload";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

/**
 * اختيار صورة لمحتوى المطعم بثلاث طرق:
 * رفع من الجهاز (الأساسية)، أو من مكتبة الصور المرفقة، أو برابط مباشر.
 */
export function ImagePicker({
  name,
  restaurantId,
  defaultValue = "",
  label = "صورة",
  aspect = "aspect-[16/10]",
}: {
  name: string;
  /** مجلد الرفع في التخزين — يضمن ألا يكتب صاحب مطعم في مجلد غيره. */
  restaurantId?: string;
  defaultValue?: string;
  label?: string;
  aspect?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);
  const [urlDraft, setUrlDraft] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { uploading, error, upload, clearError } = useImageUpload(restaurantId);

  const canUpload = isSupabaseConfigured && Boolean(restaurantId);

  const onFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // يسمح بإعادة اختيار الملف نفسه
    if (!file) return;

    const url = await upload(file);
    if (url) {
      setValue(url);
      setOpen(false);
    }
  };

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

      <Modal
        open={open}
        onClose={() => {
          clearError();
          setOpen(false);
        }}
        title={`اختيار ${label}`}
        variant="drawer"
      >
        {/* ١) الرفع من الجهاز */}
        <div className="mb-stack-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={onFileChosen}
            className="sr-only"
            aria-label="اختر صورة من جهازك"
          />
          <Button
            size="full"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canUpload || uploading}
            data-autofocus
          >
            {uploading ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden />
                جارٍ رفع الصورة…
              </>
            ) : (
              <>
                <Upload className="size-5" aria-hidden />
                رفع من الجهاز
              </>
            )}
          </Button>

          <p className="font-body text-label-sm text-on-surface-variant mt-2 text-center">
            {canUpload
              ? "JPEG أو PNG أو WebP — حتى 5 ميغابايت. تُضغط الصورة تلقائياً قبل الرفع."
              : "الرفع من الجهاز يتطلب ربط قاعدة البيانات."}
          </p>

          {error && (
            <p role="alert" className="mt-stack-md rounded-lg bg-error-container px-4 py-3 font-body text-label-md text-on-error-container">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 mb-stack-lg">
          <hr className="flex-1 border-t border-outline-variant/40" />
          <span className="font-body text-label-sm text-on-surface-variant">أو اختر جاهزة</span>
          <hr className="flex-1 border-t border-outline-variant/40" />
        </div>

        {/* ٢) رابط مباشر */}
        <div className="flex gap-2 mb-stack-lg">
          <Input
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            placeholder="الصق رابط صورة…"
            dir="ltr"
            aria-label="رابط صورة"
          />
          <Button
            variant="secondary"
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

        {/* ٣) المكتبة المرفقة */}
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
