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

      <div className="admin-filters panel admin-section-tabs">
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
        <div className="panel admin-site-text-panel">
          <div className="admin-page-head admin-site-text-head">
            <div>
              <h2 className="admin-site-text-title">
                <FileText size={18} />
                {section.label}
              </h2>
              {section.description && <p className="section-sub">{section.description}</p>}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetSection}>
              Reset section
            </button>
          </div>

          <div className="admin-site-text-fields">
            {section.fields.map((field) => (
              <label
                key={field.key}
                className={`admin-site-text-field${field.multiline ? " admin-site-text-field--wide" : ""}`}
              >
                <span className="admin-site-text-meta">
                  <span className="admin-site-text-label">{field.label}</span>
                  <code className="admin-site-text-key">{field.key}</code>
                </span>
                {field.multiline ? (
                  <textarea
                    className="admin-site-text-input no-cap"
                    rows={4}
                    value={copy[field.key] ?? ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    className="admin-site-text-input no-cap"
                    value={copy[field.key] ?? ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="admin-site-text-actions">
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
