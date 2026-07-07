"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import BrandMark from "@/components/BrandMark";

export default function ContactPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      subject: String(fd.get("subject") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      user_name: String(fd.get("name") ?? "").trim(),
      callsign: String(fd.get("callsign") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
    };

    if (!payload.subject || !payload.message) {
      setError("Subject and message are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not send your message. Please try again.");
        return;
      }

      setSent(true);
      form.reset();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-inner">
        <header className="contact-header">
          <BrandMark link={false} size="auth" />
          <h1>Contact QRZ</h1>
          <p className="section-sub">Send us a message and we will get back to you as soon as we can.</p>
        </header>

        <div className="contact-card panel">
          {sent ? (
            <div className="contact-sent">
              <h2>Message sent</h2>
              <p className="section-sub">Thanks for reaching out. We will get back to you as soon as we can.</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSent(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {error && <p className="auth-notice auth-notice--error">{error}</p>}
              <div className="contact-grid">
                <label className="field">
                  <span>Name</span>
                  <input
                    name="name"
                    required
                    defaultValue={profile?.name || user?.user_metadata?.display_name || ""}
                  />
                </label>
                <label className="field">
                  <span>Callsign</span>
                  <input
                    name="callsign"
                    className="no-cap"
                    defaultValue={profile?.callsign || ""}
                  />
                </label>
              </div>
              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  className="no-cap"
                  defaultValue={profile?.email || user?.email || ""}
                />
              </label>
              <label className="field">
                <span>Subject *</span>
                <input name="subject" required />
              </label>
              <label className="field">
                <span>Message *</span>
                <textarea name="message" rows={5} required />
              </label>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        <p className="auth-footer-link">
          <Link href="/">← Back to QRZ</Link>
        </p>
      </div>
    </div>
  );
}
