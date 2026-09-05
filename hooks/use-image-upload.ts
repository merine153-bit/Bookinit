"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage, validateImageFile } from "@/lib/image-compress";

const BUCKET = "media";

export interface UploadState {
  uploading: boolean;
  error: string | null;
}

/**
 * يرفع صورة من جهاز صاحب المطعم إلى Supabase Storage.
 *
 * المسار `media/<restaurantId>/<اسم عشوائي>.jpg` — الجزء الأول هو ما تتحقق
 * منه سياسة التخزين، فلا يستطيع صاحب مطعم الكتابة في مجلد مطعم آخر.
 * الرفع يتم من المتصفح بجلسة المستخدم مباشرة، فلا تمر بايتات الصورة
 * عبر خادم التطبيق.
 */
export function useImageUpload(restaurantId: string | undefined) {
  const [state, setState] = React.useState<UploadState>({ uploading: false, error: null });

  const upload = React.useCallback(
    async (file: File): Promise<string | null> => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setState({ uploading: false, error: validationError });
        return null;
      }

      const supabase = createClient();
      if (!supabase) {
        setState({
          uploading: false,
          error: "الرفع من الجهاز يتطلب ربط قاعدة البيانات.",
        });
        return null;
      }
      if (!restaurantId) {
        setState({ uploading: false, error: "لم يُحدَّد المطعم المرتبط بالحساب." });
        return null;
      }

      setState({ uploading: true, error: null });
      try {
        const { blob } = await compressImage(file);
        const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const path = `${restaurantId}/${name}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });

        if (error) {
          const message = error.message.toLowerCase();
          setState({
            uploading: false,
            error: message.includes("policy") || message.includes("unauthorized")
              ? "لا تملك صلاحية الرفع لهذا المطعم."
              : `تعذّر رفع الصورة: ${error.message}`,
          });
          return null;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        setState({ uploading: false, error: null });
        return data.publicUrl;
      } catch (error) {
        setState({
          uploading: false,
          error: error instanceof Error ? error.message : "تعذّر رفع الصورة.",
        });
        return null;
      }
    },
    [restaurantId],
  );

  const clearError = React.useCallback(
    () => setState((s) => ({ ...s, error: null })),
    [],
  );

  return { ...state, upload, clearError };
}
