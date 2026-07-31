"use client";

import { useEffect, useState } from "react";
import { parseHrdLogCallsign, isValidHrdLogCallsign } from "@/lib/hrdlogEmbed";
import { HrdLogWidget } from "@/components/profile/HrdLogWidget";
import { Button } from "@/components/ui/Button";
import { useSiteCopy } from "@/hooks/useSiteCopy";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type HrdLogBannerSectionProps = {
  initialCallsign?: string | null;
  editable?: boolean;
  onSaved?: (callsign: string) => void;
  className?: string;
};

export function HrdLogBannerSection({
  initialCallsign,
  editable = false,
  onSaved,
  className,
}: HrdLogBannerSectionProps) {
  const { t } = useSiteCopy();
  const [embedPaste, setEmbedPaste] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeCallsign, setActiveCallsign] = useState(
    isValidHrdLogCallsign(initialCallsign || "")
      ? (initialCallsign || "").trim().toUpperCase()
      : "",
  );

  useEffect(() => {
    const next = (initialCallsign || "").trim().toUpperCase();
    if (isValidHrdLogCallsign(next)) setActiveCallsign(next);
  }, [initialCallsign]);

  async function save() {
    const next = parseHrdLogCallsign(embedPaste);
    if (!next || !isValidHrdLogCallsign(next)) {
      setError(
        "Paste a public embed code or log URL that includes your callsign (for example from HRDLOG), or enter the callsign itself.",
      );
      return;
    }

    setError("");
    setSaving(true);
    setSaved(false);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Please sign in to save your embedded log.");
        return;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hrdlog_callsign: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save your embedded log.");
        return;
      }

      setActiveCallsign(next);
      setEmbedPaste("");
      setSaved(true);
      onSaved?.(next);
      setTimeout(() => setSaved(false), 4500);
    } finally {
      setSaving(false);
    }
  }

  const showResults = isValidHrdLogCallsign(activeCallsign);
  const parsedPreview = parseHrdLogCallsign(embedPaste);

  return (
    <div className={cn("mt-4 space-y-3", className)}>
      {editable && (
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3 sm:p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-white">{t("home.embed_title")}</p>
            <p className="text-xs text-white/75 mt-1 leading-relaxed whitespace-pre-line">
              {t("home.embed_body")}
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
              {t("home.embed_field_label")}
            </span>
            <textarea
              rows={4}
              value={embedPaste}
              placeholder={t("home.embed_placeholder")}
              onChange={(e) => {
                setEmbedPaste(e.target.value);
                setError("");
                setSaved(false);
              }}
              className="w-full rounded-xl border border-white/25 bg-white/95 text-gray-900 placeholder:text-gray-400 px-3 py-2.5 text-sm outline-none focus:border-white no-cap"
            />
          </label>

          {error && <p className="text-xs text-red-200">{error}</p>}
          {saved && (
            <p className="text-xs text-emerald-200 leading-relaxed">{t("home.embed_success")}</p>
          )}
          {!saved && !error && parsedPreview && (
            <p className="text-xs text-emerald-200">
              Ready to display log for <strong>{parsedPreview}</strong>.
            </p>
          )}
          {!saved && !error && !embedPaste.trim() && showResults && (
            <p className="text-xs text-white/70">
              Currently showing log for <strong>{activeCallsign}</strong>. Paste a new embed or URL to
              update it.
            </p>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="bg-white !text-ham-purple hover:bg-white/90 hover:!text-ham-purple font-semibold"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : t("home.embed_cta")}
          </Button>
        </div>
      )}

      {showResults && (
        <HrdLogWidget
          callsign={activeCallsign}
          lastQsoCount={25}
          variant="dark"
          className="min-h-[480px]"
        />
      )}
    </div>
  );
}
