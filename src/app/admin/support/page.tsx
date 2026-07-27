"use client";

import { useState } from "react";
import { adminFetch, useAdminData } from "@/components/admin/useAdminData";
import { fmtUTC } from "@/lib/utils";

export default function AdminSupportPage() {
  const { data, loading, refresh } = useAdminData();
  const [busyId, setBusyId] = useState("");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const resolveSupport = async (id: string, reply?: string) => {
    setBusyId(id);
    await adminFetch("/api/admin/support", {
      method: "PATCH",
      body: JSON.stringify({ id, status: "replied", reply: reply || undefined }),
    });
    await refresh();
    setBusyId("");
  };

  if (loading) return <p className="section-sub">Loading support…</p>;

  const openCount = data?.support.filter((s) => s.status === "open").length ?? 0;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Support</h1>
          <p className="section-sub">User contact messages. {openCount} open.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={refresh}>Refresh</button>
      </div>
      {data && (
        <div className="admin-support-list">
          {data.support.length === 0 && <p className="section-sub">No support messages yet.</p>}
          {data.support.map((m) => (
            <div key={m.id} className="admin-card">
              <div className="admin-card-head">
                <strong>{m.subject}</strong>
                <span className={`support-status support-status--${m.status}`}>{m.status}</span>
              </div>
              <p className="section-sub no-cap">
                {m.user_name}
                {m.callsign ? `, ${m.callsign}` : ""}
                {m.email ? `, ${m.email}` : ""}
                {", "}
                {fmtUTC(m.created_at)}
              </p>
              <p className="support-message-body">{m.message}</p>

              {m.reply && (
                <div className="admin-ai-suggestion">
                  <strong>Reply sent</strong>
                  <p>{m.reply}</p>
                </div>
              )}

              {m.status === "open" && (
                <div className="admin-panel-actions">
                  <label className="field" style={{ flex: 1, minWidth: 200 }}>
                    <span>Reply (optional)</span>
                    <textarea
                      rows={2}
                      value={replyDraft[m.id] ?? ""}
                      onChange={(e) => setReplyDraft((d) => ({ ...d, [m.id]: e.target.value }))}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={busyId === m.id}
                    onClick={() => resolveSupport(m.id, replyDraft[m.id])}
                  >
                    {busyId === m.id ? "Saving…" : "Mark resolved"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
