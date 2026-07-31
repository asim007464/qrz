"use client";

import { useEffect, useState } from "react";
import { parseHrdLogCallsign, isValidHrdLogCallsign } from "@/lib/hrdlogEmbed";
import { HrdLogWidget } from "@/components/profile/HrdLogWidget";
import { Button } from "@/components/ui/Button";
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
  const [embedPaste, setEmbedPaste] = useState("");
  const [callsign, setCallsign] = useState((initialCallsign || "").trim().toUpperCase());
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
    setCallsign(next);
    if (isValidHrdLogCallsign(next)) setActiveCallsign(next);
  }, [initialCallsign]);

  async function save() {
    const fromPaste = parseHrdLogCallsign(embedPaste);
    const next = (fromPaste || callsign).trim().toUpperCase();
    if (!next || !isValidHrdLogCallsign(next)) {
      setError("Enter a valid callsign (e.g. 9K2GV) or paste the full HRDLOG embed code.");
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
        setError("Please sign in to save your HRDLOG callsign.");
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
        setError(data.error || "Could not save HRDLOG callsign.");
        return;
      }

      setCallsign(next);
      setActiveCallsign(next);
      setEmbedPaste("");
      setSaved(true);
      onSaved?.(next);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const showResults = isValidHrdLogCallsign(activeCallsign);

  return (
    <div className={cn("mt-4 space-y-3", className)}>
      {editable && (
        <div className="rounded-2xl border border-white/20 bg-white/10 p-3 sm:p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-white">HRDLOG.net Log</p>
            <p className="text-xs text-white/75 mt-1 leading-relaxed">
              Add your log from{" "}
              <a
                href="https://www.hrdlog.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white"
              >
                HRDLOG.net
              </a>
              . Paste the full embed code <strong>or</strong> enter only your callsign (for example{" "}
              <strong>9K2GV</strong>).
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
              Paste HRDLOG embed code (optional)
            </span>
            <textarea
              rows={6}
              value={embedPaste}
              placeholder={`<!-- HRDLOG.net script start -->
<div id="hrdlog">www.hrdlog.net</div>
<script src="https://www.hrdlog.net/hrdlog.js"></script>
<script>
var ohrdlog = new HrdLog('9K2GV');
ohrdlog.LoadByCallsign();
ohrdlog.LoadLastQso(10);
</script>
<!-- HRDLOG.net script stop -->`}
              onChange={(e) => {
                const value = e.target.value;
                setEmbedPaste(value);
                const parsed = parseHrdLogCallsign(value);
                if (parsed) {
                  setCallsign(parsed);
                  setError("");
                }
              }}
              className="w-full rounded-xl border border-white/25 bg-white/95 text-gray-900 placeholder:text-gray-400 px-3 py-2.5 text-xs font-mono outline-none focus:border-white"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
              HRDLOG Callsign
            </span>
            <input
              value={callsign}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setCallsign(value);
                if (!value.trim() || isValidHrdLogCallsign(value.trim())) setError("");
              }}
              placeholder="e.g. 9K2GV"
              className="w-full rounded-xl border border-white/25 bg-white/95 text-gray-900 placeholder:text-gray-400 px-3 py-2.5 text-sm outline-none focus:border-white no-cap"
            />
          </label>

          {error && <p className="text-xs text-red-200">{error}</p>}
          {isValidHrdLogCallsign(callsign) && !error && (
            <p className="text-xs text-emerald-200">
              Ready: last QSOs for <strong>{callsign.trim().toUpperCase()}</strong> will appear below
              after you save.
            </p>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="bg-white !text-ham-purple hover:bg-white/90 hover:!text-ham-purple font-semibold"
            disabled={saving}
            onClick={() => void save()}
          >
            {saved ? "Saved!" : saving ? "Saving…" : "Save HRDLOG"}
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
