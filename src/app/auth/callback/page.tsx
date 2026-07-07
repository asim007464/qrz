"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import BrandMark from "@/components/BrandMark";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    async function verify() {
      const params = new URLSearchParams(window.location.search);

      if (params.get("failed") === "1") {
        setStatus("error");
        return;
      }

      try {
        if (window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const access_token = hash.get("access_token");
          const refresh_token = hash.get("refresh_token");
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            setStatus("success");
            setTimeout(() => router.replace("/login?verified=1"), 1500);
            return;
          }
        }

        const code = params.get("code");
        const token_hash = params.get("token_hash");
        const type = params.get("type");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setStatus("success");
          setTimeout(() => router.replace("/login?verified=1"), 1500);
          return;
        }

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as EmailOtpType,
          });
          if (error) throw error;
          setStatus("success");
          setTimeout(() => router.replace("/login?verified=1"), 1500);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("success");
          setTimeout(() => router.replace("/login?verified=1"), 1500);
          return;
        }

        setStatus("error");
      } catch (err) {
        console.error("Email verification error:", err);
        setStatus("error");
      }
    }

    verify();
  }, [router]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send email.");
      setResendMsg("New verification email sent. Check your inbox.");
    } catch (err) {
      setResendMsg(err instanceof Error ? err.message : "Could not send email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card panel" style={{ textAlign: "center" }}>
        <BrandMark link={false} size="auth" />
        {status === "loading" && <p className="section-sub" style={{ marginTop: 24 }}>Verifying your email…</p>}
        {status === "success" && (
          <>
            <CheckCircle2 size={32} className="auth-done-icon" style={{ margin: "24px auto" }} />
            <h1>Email Verified!</h1>
            <p className="section-sub">Redirecting you to sign in…</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={32} style={{ color: "#ef4444", margin: "24px auto" }} />
            <h1>Verification Failed</h1>
            <p className="section-sub">
              The link may have expired or already been used. Request a new verification email below.
            </p>
            <form onSubmit={handleResend} className="auth-form" style={{ marginTop: 16, textAlign: "left" }}>
              <label className="field">
                <span>Email address</span>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  className="no-cap"
                />
              </label>
              <button type="submit" className="btn btn-primary auth-submit" disabled={resending}>
                {resending ? "Sending…" : "Resend verification email"}
              </button>
            </form>
            {resendMsg && (
              <p className={`auth-notice ${resendMsg.includes("sent") ? "auth-notice--success" : "auth-notice--error"}`} style={{ marginTop: 12 }}>
                {resendMsg}
              </p>
            )}
            <a href="/register" className="btn btn-ghost" style={{ marginTop: 12 }}>Register again</a>
          </>
        )}
      </div>
    </div>
  );
}
