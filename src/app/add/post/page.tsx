"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { MAX_IMAGE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/constants";
import { compressImageFile } from "@/lib/compressImage";
import { useSiteCopy } from "@/hooks/useSiteCopy";

export default function MakePostPage() {
  const router = useRouter();
  const { isLoggedIn, profile, loading: authLoading } = useAuth();
  const { t } = useSiteCopy();
  const fileRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace("/login?next=/add/post");
    }
  }, [authLoading, isLoggedIn, router]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Image must be smaller than ${MAX_IMAGE_SIZE_LABEL}.`);
      return;
    }

    void (async () => {
      try {
        const dataUrl = await compressImageFile(file);
        setImageUrl(dataUrl);
        setError("");
      } catch {
        setError("Could not process that image. Try a smaller photo.");
      }
    })();
  };

  const canPublish = Boolean(content.trim() || imageUrl);

  const publish = async () => {
    const text = content.trim();
    if (!text && !imageUrl) {
      setError("Add text, an image, or both to publish.");
      return;
    }

    setPosting(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.replace("/login?next=/add/post");
        return;
      }

      const res = await fetch("/api/feed", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          image_url: imageUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish post.");
      }

      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish post.");
    } finally {
      setPosting(false);
    }
  };

  if (authLoading || !isLoggedIn) {
    return (
      <AppShell>
        <PageHeader title={t("add_post.title")} backHref="/add" />
        <p className="text-sm text-gray-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title={t("add_post.title")} backHref="/add" />

      <Card className="space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">
            Posting as{" "}
            <span className="text-ham-purple font-semibold">
              {profile?.callsign || "operator"}
            </span>
          </p>
          <Textarea
            label={t("add_post.textarea_label")}
            rows={5}
            placeholder={t("add_post.placeholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Post preview" className="w-full max-h-56 object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-black/50 text-white hover:bg-black/70"
              aria-label="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 hover:border-ham-purple/40 hover:text-ham-purple hover:bg-ham-purple/5 transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            {t("add_post.add_photo")}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImage}
        />

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => void publish()}
            disabled={posting || !canPublish}
          >
            {posting ? "Publishing…" : t("add_post.publish_cta")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="sm:w-auto"
            onClick={() => router.push("/add")}
            disabled={posting}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
