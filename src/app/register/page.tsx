"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { PasswordInput, passwordFieldAttrs } from "@/components/PasswordInput";
import { checkPassword } from "@/lib/passwordUtils";
import { getSafeRedirectPath } from "@/lib/authRedirect";

type Step = "form" | "otp" | "done";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [otp, setOtp] = useState("");
  const [sentNotice, setSentNotice] = useState("");
  const [redirectTo, setRedirectTo] = useState("/");

  const pwStrength = checkPassword(password);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectTo(getSafeRedirectPath(params.get("next")));
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) return setError("Display name is required.");
    if (!callsign.trim()) return setError("Callsign is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (!pwStrength.passed) return setError("Password does not meet all requirements.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (!agreeTerms) return setError("You must agree to the terms.");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          callsign: callsign.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed.");

      setSentNotice(data.message ?? "A 6-digit code was sent to your email.");
      setStep("otp");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      if (msg.toLowerCase().includes("already exists")) {
        setError("An account with this email already exists. Try signing in.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not resend code.");
      setSentNotice(data.message ?? "A new code was sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code.");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <div className="auth-page">
        <div className="auth-card panel">
          <div className="auth-done">
            <CheckCircle2 size={40} className="auth-done-icon" />
            <h1>Email Verified</h1>
            <p className="section-sub">
              Your account is ready. Sign in with <strong className="no-cap">{email}</strong> and your password.
            </p>
            <Link
              href={redirectTo === "/" ? "/login?verified=1" : `/login?verified=1&next=${encodeURIComponent(redirectTo)}`}
              className="btn btn-primary auth-submit"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="auth-page">
        <div className="auth-card panel">
          <div className="auth-header">
            <BrandMark link={false} size="auth" />
            <h1>Verify Your Email</h1>
            <p className="section-sub">
              Enter the 6-digit code sent to <strong className="no-cap">{email}</strong>
            </p>
          </div>

          {error && <p role="alert" className="auth-notice auth-notice--error">{error}</p>}
          {sentNotice && <p className="auth-notice auth-notice--success">{sentNotice}</p>}

          <div className="auth-form">
            <label className="field">
              <span>6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                autoComplete="one-time-code"
                className="auth-otp no-cap"
              />
            </label>
            <button type="button" className="btn btn-primary auth-submit" onClick={verifyOtp} disabled={loading}>
              {loading ? <Loader2 size={15} className="spin" /> : null}
              {loading ? "Verifying…" : "Verify email"} {!loading && <ArrowRight size={14} />}
            </button>
            <button type="button" className="auth-link-btn" onClick={resendCode} disabled={loading}>
              {loading ? "Sending…" : "Resend code"}
            </button>
          </div>

          <p className="auth-footer-link">
            Wrong email?{" "}
            <button type="button" className="auth-link-btn" onClick={() => { setStep("form"); setOtp(""); setError(""); }}>
              Go back
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <div className="auth-header">
          <BrandMark link={false} size="auth" />
          <h1>Create Your Account</h1>
          <p className="section-sub">Join the QRZ ham radio social network</p>
        </div>

        {error && <p role="alert" className="auth-notice auth-notice--error">{error}</p>}

        <form onSubmit={handleRegister} className="auth-form">
          <label className="field">
            <span>Display name</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </label>
          <label className="field">
            <span>Callsign</span>
            <input
              value={callsign}
              onChange={(e) => setCallsign(e.target.value.toUpperCase())}
              required
              className="no-cap"
              placeholder="K2ABC"
            />
          </label>
          <label className="field">
            <span>Email address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="no-cap" />
          </label>
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            visible={showPassword}
            onVisibleChange={setShowPassword}
          >
            {password.length > 0 && (
              <ul className="pw-checks">
                {pwStrength.checks.map((check) => (
                  <li key={check.label} className={check.ok ? "ok" : ""}>{check.ok ? "✓" : "○"} {check.label}</li>
                ))}
              </ul>
            )}
          </PasswordInput>
          <div className="field">
            <label htmlFor="confirm-password">Confirm password</label>
            <input
              id="confirm-password"
              {...passwordFieldAttrs(showPassword)}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="no-cap"
            />
          </div>
          <label className="auth-checkbox">
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </label>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader2 size={15} className="spin" /> : null}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer-link">
          Already have an account?{" "}
          <Link href={redirectTo === "/" ? "/login" : `/login?next=${encodeURIComponent(redirectTo)}`}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
