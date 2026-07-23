"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";

const MAX_BYTES = 750 * 1024;

type FieldImagePickerProps = {
  label?: string;
  imageUrl?: string | null;
  onChange: (dataUrl: string | null) => void | Promise<void>;
};

export function FieldImagePicker({
  label = "Photo",
  imageUrl,
  onChange,
}: FieldImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be smaller than 750KB.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const dataUrl = await readAsDataUrl(file);
      await onChange(dataUrl);
    } catch {
      setError("Could not read that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className="flex items-center gap-1">
          {imageUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onChange(null)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              aria-label="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ham-purple hover:bg-ham-purple/10 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
            {imageUrl ? "Change" : "Add pic"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e)}
          />
        </div>
      </div>

      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="w-full max-h-40 object-cover" />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
