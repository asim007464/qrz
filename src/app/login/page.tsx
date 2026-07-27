"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { PasswordInput } from "@/components/PasswordInput";
import Toast, { useToast } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { getSafeRedirectPath } from "@/lib/authRedirect";
import { formatAuthError } from "@/lib/authErrors";

export default function LoginPage() {
  const router = useRouter();
  const { message, showToast, clear } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [welcomeCallsign, setWelcomeCallsign] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState("/");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(getSafeRedirectPath(params.get("next")));
    if (params.get("verified") === "1") {
      setVerified(true);
      showToast("Email verified! You can sign in now.");
    }
    if (params.get("welcome") === "1") {
      const callsign = params.get("callsign");
      setWelcomeCallsign(callsign);
      showToast(
        callsign
          ? `Welcome to QRZ, ${callsign}! Sign in to get started.`
          : "Welcome to QRZ! Sign in to get started."
      );
    }
  }, [showToast]);

  async function handleResendVerification() {
    if (!pendingEmail) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send email.");
      showToast("Verification code sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send verification code.");
    } finally {
      setResending(false);
    }
  }

  async function handleVerifyOtp() {
    if (!pendingEmail || !/^\d{6}$/.test(verificationOtp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifyingOtp(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp: verificationOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code.");
      setNeedsVerification(false);
      setVerificationOtp("");
      showToast("Email verified! You can sign in now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsVerification(false);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPendingEmail(email);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        const formatted = formatAuthError(authError.message);
        setError(formatted.error);
        setNeedsVerification(Boolean(formatted.needsVerification));
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_blocked")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.is_blocked) {
          await supabase.auth.signOut();
          setError("Your account has been blocked. Contact us for help.");
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch("/api/auth/sanitize-session", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch(() => null);
        await supabase.auth.refreshSession();
      }

      showToast("Signed in successfully!");
      router.refresh();
      window.setTimeout(() => {
        router.push(redirectTo);
      }, 400);
    } catch {
      setError("Could not sign in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="auth-page">
        <div className="auth-card panel">
          <div className="auth-header">
            <BrandMark link={false} size="auth" />
            <h1>Sign In To QRZ</h1>
            <p className="section-sub">Sign in to access the ham radio social network. New users must register first.</p>
          </div>

          {welcomeCallsign && (
            <p className="auth-notice auth-notice--success">
              Welcome to QRZ, <strong className="no-cap">{welcomeCallsign}</strong>! Your account is ready — sign in below.
            </p>
          )}

          {verified && (
            <p className="auth-notice auth-notice--success">
              Your email is verified. Sign in with your password.
            </p>
          )}

          {error && (
            <p role="alert" className="auth-notice auth-notice--error">{error}</p>
          )}

          {needsVerification && (
            <div className="auth-form" style={{ marginBottom: 16 }}>
              <p className="auth-notice auth-notice--success" style={{ marginBottom: 12 }}>
                Your email is not verified yet. Enter the 6-digit code sent to your inbox.
              </p>
              <label className="field">
                <span>6-digit verification code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationOtp}
                  onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  className="auth-otp no-cap"
                />
              </label>
              <button
                type="button"
                className="btn btn-primary auth-submit"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp}
              >
                {verifyingOtp ? "Verifying…" : "Verify email"}
              </button>
              <button
                type="button"
                className="auth-link-btn"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending ? "Sending…" : "Resend code"}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Email address</span>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="username"
                required
                className="no-cap"
                defaultValue={pendingEmail}
              />
            </label>
            <PasswordInput
              label="Password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <p className="auth-forgot">
              <Link href="/forgot-password">Forgot password?</Link>
            </p>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <Loader2 size={15} className="spin" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-footer-link">
            No account?{" "}
            <Link href={redirectTo === "/" ? "/register" : `/register?next=${encodeURIComponent(redirectTo)}`}>
              Register free
            </Link>
          </p>
          <p className="auth-footer-link" style={{ marginTop: 12 }}>
            New to QRZ?{" "}
            <Link href={redirectTo === "/" ? "/register" : `/register?next=${encodeURIComponent(redirectTo)}`}>
              Create a free account
            </Link>
          </p>
        </div>
      </div>
      <Toast message={message} onDone={clear} />
    </>
  );
}
