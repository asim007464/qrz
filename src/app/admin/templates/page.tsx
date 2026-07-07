"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/components/admin/useAdminData";
import type { AdminTemplate } from "@/components/admin/useAdminData";
import { QSLCardTemplate } from "@/components/qsl/QSLCardTemplate";

const emptyForm = {
  name: "",
  background_color: "#2e1a47",
  accent_color: "#7c3aed",
  border_color: "#f5e6c8",
  background_image: "",
  is_active: true,
};

const previewCard = {
  fromCallsign: "K2ABC",
  fromName: "Operator Name",
  fromAddress: "Address Line",
  fromCountry: "Country",
  ituZone: "ITU Zone 8",
  toCallsign: "DL9XX",
  date: "2024-01-01",
  utc: "12:00",
  mhz: "14.230",
  mode: "FT8",
  rst: "599",
  qslVia: "LoTW",
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadTemplates() {
    setLoading(true);
    const res = await adminFetch("/api/admin/templates");
    if (res.ok) {
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } else {
      setError("Could not load templates.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(t: AdminTemplate) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      background_color: t.background_color,
      accent_color: t.accent_color,
      border_color: t.border_color,
      background_image: t.background_image ?? "",
      is_active: t.is_active,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Template name is required.");
      return;
    }
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      background_image: form.background_image.trim() || null,
    };
    const res = editingId
      ? await adminFetch(`/api/admin/templates/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await adminFetch("/api/admin/templates", { method: "POST", body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Save failed.");
      setBusy(false);
      return;
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    await loadTemplates();
    setBusy(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template? This cannot be undone.")) return;
    setBusy(true);
    const res = await adminFetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Delete failed.");
    } else {
      await loadTemplates();
    }
    setBusy(false);
  }

  const previewTemplate = {
    id: "preview",
    name: form.name || "Preview",
    backgroundColor: form.background_color,
    accentColor: form.accent_color,
    borderColor: form.border_color,
    backgroundImage: form.background_image || undefined,
    isAdminCreated: true,
  };

  if (loading) return <p className="section-sub">Loading templates…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>QSL Templates</h1>
          <p className="section-sub">Create and manage QSL card templates for all users.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={14} /> New template
        </button>
      </div>

      {error && <p className="auth-notice auth-notice--error">{error}</p>}

      {showForm && (
        <div className="admin-panel-card panel" style={{ marginBottom: 24 }}>
          <h2>{editingId ? "Edit template" : "New template"}</h2>
          <form onSubmit={handleSave} className="admin-template-form">
            <div className="admin-template-form-grid">
              <div>
                <label className="field">
                  <span>Name</span>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </label>
                <label className="field">
                  <span>Background color</span>
                  <input type="color" value={form.background_color} onChange={(e) => setForm((f) => ({ ...f, background_color: e.target.value }))} />
                </label>
                <label className="field">
                  <span>Accent color</span>
                  <input type="color" value={form.accent_color} onChange={(e) => setForm((f) => ({ ...f, accent_color: e.target.value }))} />
                </label>
                <label className="field">
                  <span>Border color</span>
                  <input type="color" value={form.border_color} onChange={(e) => setForm((f) => ({ ...f, border_color: e.target.value }))} />
                </label>
                <label className="field">
                  <span>Background image URL (optional)</span>
                  <input
                    className="no-cap"
                    value={form.background_image}
                    onChange={(e) => setForm((f) => ({ ...f, background_image: e.target.value }))}
                    placeholder="https://…"
                  />
                </label>
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  />
                  <span>Active (visible to users)</span>
                </label>
                <div className="admin-panel-actions">
                  <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? "Saving…" : editingId ? "Update template" : "Create template"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
              <div className="admin-template-preview">
                <p className="section-sub">Preview</p>
                <QSLCardTemplate card={previewCard} template={previewTemplate} />
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="admin-templates-grid">
        {templates.length === 0 && <p className="section-sub">No templates yet. Create one above.</p>}
        {templates.map((t) => (
          <div key={t.id} className="admin-card">
            <div className="admin-card-head">
              <strong>{t.name}</strong>
              <span className={`support-status support-status--${t.is_active ? "resolved" : "open"}`}>
                {t.is_active ? "active" : "inactive"}
              </span>
            </div>
            <QSLCardTemplate
              card={previewCard}
              template={{
                id: t.id,
                name: t.name,
                backgroundColor: t.background_color,
                accentColor: t.accent_color,
                borderColor: t.border_color,
                backgroundImage: t.background_image ?? undefined,
                isAdminCreated: true,
              }}
            />
            <div className="admin-panel-actions" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>
                <Pencil size={14} /> Edit
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleDelete(t.id)} disabled={busy}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
