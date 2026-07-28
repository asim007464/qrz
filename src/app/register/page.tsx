"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Camera, CheckCircle2, Loader2, ArrowRight, MapPin } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { PasswordInput, passwordFieldAttrs } from "@/components/PasswordInput";
import { checkPassword } from "@/lib/passwordUtils";
import { getSafeRedirectPath } from "@/lib/authRedirect";
import { MAX_IMAGE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/constants";
import { compressImageFile } from "@/lib/compressImage";
import { useSiteCopy } from "@/hooks/useSiteCopy";

type Step = "form" | "otp" | "done";

export default function RegisterPage() {
  const { t } = useSiteCopy();
  const [displayName, setDisplayName] = useState("");
  const [callsign, setCallsign] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [ituZone, setItuZone] = useState("ITU Zone 8");
  const [activeBand, setActiveBand] = useState("20m");
  const [activeFrequency, setActiveFrequency] = useState("14.240 MHz");
  const [activeMode, setActiveMode] = useState("USB");
  const [cqZone, setCqZone] = useState("CQ Zone 22");
  const [grid, setGrid] = useState("MK7QB");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
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

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Location is not supported in this browser.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        try {
          const url = new URL("https://nominatim.openstreetmap.org/reverse");
          url.searchParams.set("lat", String(pos.coords.latitude));
          url.searchParams.set("lon", String(pos.coords.longitude));
          url.searchParams.set("format", "json");
          const res = await fetch(url.toString(), {
            headers: { "User-Agent": "QRZ-Social/1.0" },
          });
          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.state ||
              "";
            const countryName = data.address?.country || "";
            if (city) setLocation(city);
            if (countryName) setCountry(countryName);
          }
        } catch {
          /* coords still saved */
        }
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Enter it manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) return setError("Display name is required.");
    if (!callsign.trim()) return setError("Callsign is required.");
    if (!avatarUrl) return setError("Profile photo is required.");
    if (!location.trim()) return setError("Location is required.");
    if (!country.trim()) return setError("Country is required.");
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
          avatarUrl,
          location: location.trim(),
          country: country.trim(),
          ituZone: ituZone.trim(),
          activeBand: activeBand.trim(),
          activeFrequency: activeFrequency.trim(),
          activeMode: activeMode.trim().toUpperCase(),
          cqZone: cqZone.trim(),
          grid: grid.trim().toUpperCase(),
          latitude,
          longitude,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed.");

      if (data.requiresVerification === false) {
        setStep("done");
        return;
      }

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

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Upload a valid image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Image must be smaller than ${MAX_IMAGE_SIZE_LABEL}.`);
      return;
    }
    void (async () => {
      try {
        const dataUrl = await compressImageFile(file);
        setAvatarUrl(dataUrl);
        setError("");
      } catch {
        setError("Could not process that image. Try a smaller photo.");
      }
    })();
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
    const loginHref =
      redirectTo === "/"
        ? `/login?welcome=1&callsign=${encodeURIComponent(callsign)}&verified=1`
        : `/login?welcome=1&callsign=${encodeURIComponent(callsign)}&verified=1&next=${encodeURIComponent(redirectTo)}`;

    return (
      <div className="auth-page">
        <div className="auth-card panel">
          <div className="auth-done">
            <CheckCircle2 size={48} className="auth-done-icon" />
            <h1>{t("register.welcome_title")}</h1>
            <p className="section-sub" style={{ textAlign: "center", lineHeight: 1.6 }}>
              73, <strong>{displayName}</strong>! Your operator profile{" "}
              <strong className="no-cap">{callsign}</strong> is ready on the QRZ social network.
            </p>
            <div className="auth-welcome-box">
              <p className="auth-welcome-title">You can now:</p>
              <ul className="auth-welcome-list">
                <li>Share your digital card and QSL cards</li>
                <li>Connect with operators worldwide</li>
                <li>Track profile views and analytics</li>
              </ul>
            </div>
            <Link href={loginHref} className="btn btn-primary auth-submit">
              Sign in to QRZ
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
            <h1>{t("register.verify_title")}</h1>
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
          <h1>{t("register.title")}</h1>
          <p className="section-sub">{t("register.subtitle")}</p>
        </div>

        {error && <p role="alert" className="auth-notice auth-notice--error">{error}</p>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-avatar-upload">
            <label className="auth-avatar-preview">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile preview" />
              ) : (
                <Camera size={28} />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} />
            </label>
            <div>
              <p className="auth-avatar-title">Upload profile photo</p>
              <p className="auth-avatar-help">Required. This appears on your QRZ card.</p>
            </div>
          </div>

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
          <div className="auth-grid-2">
            <label className="field">
              <span>Where are you from?</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="New York, USA" />
            </label>
            <label className="field">
              <span>Country</span>
              <input value={country} onChange={(e) => setCountry(e.target.value)} required placeholder="USA" />
            </label>
          </div>
          <button
            type="button"
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
            onClick={() => void useMyLocation()}
            disabled={locating}
          >
            {locating ? <Loader2 size={15} className="spin" /> : <MapPin size={15} />}
            {locating
              ? "Getting location…"
              : latitude != null
                ? `Location set (${latitude.toFixed(2)}, ${longitude?.toFixed(2)})`
                : "Use my location on map"}
          </button>
          <div className="auth-grid-3">
            <label className="field">
              <span>Band</span>
              <input value={activeBand} onChange={(e) => setActiveBand(e.target.value)} required className="no-cap" />
            </label>
            <label className="field">
              <span>Frequency</span>
              <input value={activeFrequency} onChange={(e) => setActiveFrequency(e.target.value)} required className="no-cap" />
            </label>
            <label className="field">
              <span>Mode</span>
              <input value={activeMode} onChange={(e) => setActiveMode(e.target.value.toUpperCase())} required className="no-cap" />
            </label>
          </div>
          <div className="auth-grid-3">
            <label className="field">
              <span>CQ Zone</span>
              <input value={cqZone} onChange={(e) => setCqZone(e.target.value)} required className="no-cap" />
            </label>
            <label className="field">
              <span>ITU Zone</span>
              <input value={ituZone} onChange={(e) => setItuZone(e.target.value)} required className="no-cap" />
            </label>
            <label className="field">
              <span>Grid</span>
              <input value={grid} onChange={(e) => setGrid(e.target.value.toUpperCase())} required className="no-cap" />
            </label>
          </div>
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
            {loading ? "Creating account…" : t("register.submit_cta")}
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
