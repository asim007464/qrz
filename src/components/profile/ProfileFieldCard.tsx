"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { MAX_IMAGE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/constants";
import { compressImageFile } from "@/lib/compressImage";

type ProfileFieldCardProps = {
  title: string;
  content: string;
  imageUrl?: string | null;
  editable?: boolean;
  onImageChange?: (dataUrl: string | null) => void | Promise<void>;
  onContentChange?: (value: string) => void | Promise<void>;
  contentPlaceholder?: string;
  className?: string;
};

export function ProfileFieldCard({
  title,
  content,
  imageUrl,
  editable = false,
  onImageChange,
  onContentChange,
  contentPlaceholder = "Tap edit to add details…",
  className,
}: ProfileFieldCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    if (!editing) setDraft(content);
  }, [content, editing]);

  const pickFile = () => {
    setError("");
    inputRef.current?.click();
  };

  const startEditing = () => {
    setDraft(content);
    setEditing(true);
    setError("");
  };

  const cancelEditing = () => {
    setDraft(content);
    setEditing(false);
    setError("");
  };

  const saveContent = async () => {
    if (!onContentChange) return;
    setBusy(true);
    setError("");
    try {
      await onContentChange(draft.trim());
      setEditing(false);
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onImageChange) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Image must be smaller than ${MAX_IMAGE_SIZE_LABEL}.`);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const dataUrl = await compressImageFile(file);
      await onImageChange(dataUrl);
    } catch {
      setError("Could not read that image.");
    } finally {
      setBusy(false);
    }
  };

  const removeImage = async () => {
    if (!onImageChange) return;
    setBusy(true);
    setError("");
    try {
      await onImageChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={cn("relative", className)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-ham-purple">{title}</h3>
        {editable && (
          <div className="flex items-center gap-1 shrink-0">
            {onContentChange && !editing && (
              <button
                type="button"
                onClick={startEditing}
                disabled={busy}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ham-purple hover:bg-ham-purple/10 transition-colors disabled:opacity-50"
                aria-label={`Edit ${title}`}
                title="Edit text"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onImageChange && imageUrl && (
              <button
                type="button"
                onClick={() => void removeImage()}
                disabled={busy}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                aria-label={`Remove ${title} photo`}
                title="Remove photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {onImageChange && (
              <button
                type="button"
                onClick={pickFile}
                disabled={busy}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ham-purple hover:bg-ham-purple/10 transition-colors disabled:opacity-50"
                aria-label={imageUrl ? `Change ${title} photo` : `Add ${title} photo`}
                title={imageUrl ? "Change photo" : "Add photo"}
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
              </button>
            )}
            {onImageChange && (
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleFile(e)}
              />
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder={contentPlaceholder}
            className="text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void saveContent()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ham-purple px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 leading-relaxed">{content || "—"}</p>
      )}

      {imageUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${title} photo`}
            className="w-full max-h-52 object-cover"
          />
        </div>
      )}

      {editable && !imageUrl && onImageChange && (
        <button
          type="button"
          onClick={pickFile}
          disabled={busy}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3 text-xs font-medium text-gray-500 hover:border-ham-purple/40 hover:text-ham-purple hover:bg-ham-purple/5 transition-colors disabled:opacity-50"
        >
          <ImagePlus className="w-4 h-4" />
          Add photo
        </button>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </Card>
  );
}
