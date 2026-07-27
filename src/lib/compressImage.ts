import { MAX_IMAGE_BYTES } from "@/lib/constants";

type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxBytes?: number;
};

/** Resize/compress an image file for upload (keeps payload under server limits). */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const maxWidth = options.maxWidth ?? 1200;
  const maxHeight = options.maxHeight ?? 1200;
  const maxBytes = options.maxBytes ?? MAX_IMAGE_BYTES;
  let quality = options.quality ?? 0.85;

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not process image.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrlSize = (url: string) => {
    const base64 = url.split(",")[1] || "";
    return Math.ceil((base64.length * 3) / 4);
  };

  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrlSize(dataUrl) > maxBytes && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrlSize(dataUrl) > maxBytes) {
    throw new Error("Image is still too large after compression. Try a smaller photo.");
  }

  return dataUrl;
}
