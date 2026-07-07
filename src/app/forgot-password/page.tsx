"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { PasswordInput, passwordFieldAttrs } from "@/components/PasswordInput";
import { checkPassword } from "@/lib/passwordUtils";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentNotice, setSentNotice] = useState("");

  const pwStrength = checkPassword(password);

  async function sendOtp() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSentNotice("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send code.");

      setSentNotice(data.message ?? "If an account exists for this email, a 6-digit code has been sent.");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpAndContinue() {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code.");
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!pwStrength.passed) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not reset password.");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <div className="auth-header">
          <BrandMark link={false} size="auth" />
          <h1>{step === "done" ? "Password Updated" : "Reset Your Password"}</h1>
          <p className="section-sub">
            {step === "email" && "We will email you a 6-digit verification code."}
            {step === "otp" && `Enter the code sent to ${email}`}
            {step === "password" && "Choose a new password for your account."}
            {step === "done" && "You can sign in with your new password."}
          </p>
        </div>

        {error && <p role="alert" className="auth-notice auth-notice--error">{error}</p>}
        {sentNotice && step === "otp" && (
          <p className="auth-notice auth-notice--success">{sentNotice}</p>
        )}

        {step === "email" && (
          <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="auth-form">
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="no-cap"
              />
            </label>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <Loader2 size={15} className="spin" /> : null}
              {loading ? "Sending code…" : "Send code"} {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        )}

        {step === "otp" && (
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
            <button type="button" className="btn btn-primary auth-submit" onClick={verifyOtpAndContinue} disabled={loading}>
              {loading ? <Loader2 size={15} className="spin" /> : null}
              Continue <ArrowRight size={14} />
            </button>
            <button type="button" className="auth-link-btn" onClick={sendOtp} disabled={loading}>
              {loading ? "Sending…" : "Resend code"}
            </button>
            <button type="button" className="auth-back-btn" onClick={() => { setStep("email"); setOtp(""); setError(""); }}>
              <ArrowLeft size={14} /> Change email
            </button>
          </div>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <PasswordInput
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, upper, lower, number, symbol"
              autoComplete="new-password"
              required
              visible={showPassword}
              onVisibleChange={setShowPassword}
            >
              {password.length > 0 && (
                <ul className="pw-checks">
                  {pwStrength.checks.map((check) => (
                    <li key={check.label} className={check.ok ? "ok" : ""}>
                      {check.ok ? "✓" : "○"} {check.label}
                    </li>
                  ))}
                </ul>
              )}
            </PasswordInput>
            <div className="field">
              <label htmlFor="confirm-new-password">Confirm new password</label>
              <input
                id="confirm-new-password"
                {...passwordFieldAttrs(showPassword)}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                className="no-cap"
              />
            </div>
            <button type="button" className="auth-back-btn" onClick={() => setStep("otp")}>
              <ArrowLeft size={14} /> Back to code
            </button>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <Loader2 size={15} className="spin" /> : null}
              Reset password
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="auth-done">
            <CheckCircle2 size={40} className="auth-done-icon" />
            <button type="button" className="btn btn-primary auth-submit" onClick={() => router.push("/login")}>
              Go to sign in
            </button>
          </div>
        )}

        {step !== "done" && (
          <p className="auth-footer-link">
            Remember your password? <Link href="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
