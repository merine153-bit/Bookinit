"use client";

/**
 * ضغط الصور في المتصفح قبل رفعها.
 *
 * صور الهواتف تصل إلى عدة ميغابايتات، وأكبر عرض يستخدمه التطبيق 1200 بكسل.
 * الضغط هنا يقلّل زمن الرفع وحجم التخزين بلا فرق مرئي، ويبقي الملف تحت
 * حدّ الحاوية (5 ميغابايت).
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export interface CompressResult {
  blob: Blob;
  width: number;
  height: number;
}

/** يتحقق من نوع الملف وحجمه ويعيد رسالة عربية عند الرفض. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "الصيغة غير مدعومة — اختر صورة JPEG أو PNG أو WebP.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "حجم الصورة يتجاوز 5 ميغابايت.";
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("تعذّرت قراءة الصورة — قد يكون الملف تالفاً."));
    };
    image.src = url;
  });
}

/** يحجّم الصورة إلى 1600 بكسل كحد أقصى ويعيد ترميزها JPEG. */
export async function compressImage(file: File): Promise<CompressResult> {
  const image = await loadImage(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("متصفحك لا يدعم معالجة الصور.");
  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) throw new Error("تعذّر تجهيز الصورة للرفع.");

  return { blob, width, height };
}
