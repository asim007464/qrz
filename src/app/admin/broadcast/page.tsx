"use client";

import { useState } from "react";
import { adminFetch } from "@/components/admin/useAdminData";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setSending(true);
    setError("");
    setSuccess(false);
    try {
      const res = await adminFetch("/api/admin/broadcast", {
        method: "POST",
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Broadcast failed.");
        return;
      }
      setTitle("");
      setMessage("");
      setSuccess(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Broadcast</h1>
          <p className="section-sub">Message all registered users</p>
        </div>
      </div>
      <div className="panel" style={{ padding: 24, maxWidth: 640 }}>
        {error && <p className="auth-notice auth-notice--error">{error}</p>}
        {success && <p className="auth-notice auth-notice--success">Broadcast sent to all users.</p>}
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        <button type="button" className="btn btn-primary" onClick={sendBroadcast} disabled={sending}>
          {sending ? "Sending…" : "Send Broadcast"}
        </button>
      </div>
    </div>
  );
}
