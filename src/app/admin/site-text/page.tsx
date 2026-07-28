"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { adminFetch } from "@/components/admin/useAdminData";
import {
  DEFAULT_SITE_COPY,
  SITE_COPY_SECTIONS,
  type SiteCopyMap,
} from "@/lib/siteCopy";
import { invalidateSiteCopyCache } from "@/hooks/useSiteCopy";

export default function AdminSiteTextPage() {
  const [copy, setCopy] = useState<SiteCopyMap>({ ...DEFAULT_SITE_COPY });
  const [sectionId, setSectionId] = useState(SITE_COPY_SECTIONS[0]?.id || "home");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const section = useMemo(
    () => SITE_COPY_SECTIONS.find((s) => s.id === sectionId) || SITE_COPY_SECTIONS[0],
    [sectionId]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await adminFetch("/api/admin/site-copy");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load site text");
        if (!cancelled) setCopy({ ...DEFAULT_SITE_COPY, ...(data.copy || {}) });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load site text");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(key: string, value: string) {
    setCopy((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  function resetSection() {
    if (!section) return;
    setCopy((prev) => {
      const next = { ...prev };
      for (const field of section.fields) {
        next[field.key] = DEFAULT_SITE_COPY[field.key] || "";
      }
      return next;
    });
    setMessage("Section reset to defaults (not saved yet).");
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await adminFetch("/api/admin/site-copy", {
        method: "PUT",
        body: JSON.stringify({ copy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setCopy({ ...DEFAULT_SITE_COPY, ...(data.copy || {}) });
      invalidateSiteCopyCache();
      setMessage("Site text saved. Refresh public pages to see updates.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="section-sub">Loading site text…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Site text</h1>
          <p className="section-sub">
            Edit static headings and copy shown on public pages.
          </p>
        </div>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save all changes"}
        </button>
      </div>

      {error && <p className="auth-notice auth-notice--error">{error}</p>}
      {message && <p className="auth-notice auth-notice--success">{message}</p>}

      <div className="admin-filters panel" style={{ flexWrap: "wrap", gap: 8 }}>
        {SITE_COPY_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`btn btn-sm ${sectionId === s.id ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setSectionId(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="admin-page-head" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18 }}>
                <FileText size={18} />
                {section.label}
              </h2>
              {section.description && <p className="section-sub">{section.description}</p>}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetSection}>
              Reset section
            </button>
          </div>

          <div className="space-y-4" style={{ display: "grid", gap: 16 }}>
            {section.fields.map((field) => (
              <label key={field.key} className="field" style={{ display: "block" }}>
                <span style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                  {field.label}
                </span>
                {field.multiline ? (
                  <textarea
                    className="admin-filter-input no-cap"
                    rows={3}
                    value={copy[field.key] ?? ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    style={{ width: "100%", minHeight: 84 }}
                  />
                ) : (
                  <input
                    className="admin-filter-input no-cap"
                    value={copy[field.key] ?? ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    style={{ width: "100%" }}
                  />
                )}
                <span className="section-sub" style={{ display: "block", marginTop: 4, fontSize: 11 }}>
                  {field.key}
                </span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetSection}>
              Reset section
            </button>
            <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void save()}>
              {saving ? "Saving…" : "Save all changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
