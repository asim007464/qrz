import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyOtp } from "@/lib/otp";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const OTP_RE = /^\d{6}$/;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_FAILED_ATTEMPTS = 5;

export type AccountRecord = { id: string; email: string };

export async function findAccountByEmail(supabase: SupabaseClient, email: string): Promise<AccountRecord | null> {
  const { data: profile } = await supabase.from("profiles").select("id, email").ilike("email", email).maybeSingle();
  if (profile?.id) return { id: profile.id, email: profile.email ?? email };
  const { data: linkData, error } = await supabase.auth.admin.generateLink({ type: "recovery", email });
  if (error || !linkData.user?.id) return null;
  return { id: linkData.user.id, email: linkData.user.email ?? email };
}

export async function getActiveResetOtp(supabase: SupabaseClient, email: string) {
  const { data: otpRow, error: otpError } = await supabase
    .from("password_reset_otps")
    .select("id, code_hash, expires_at, used_at, failed_attempts")
    .eq("email", email)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (otpError) {
    if (otpError.code === "42P01") throw new Error("Run password_reset_otps migration in Supabase.");
    throw otpError;
  }
  if (!otpRow) return { ok: false as const, error: "Invalid or expired code." };
  if (otpRow.used_at || new Date(otpRow.expires_at) < new Date()) {
    return { ok: false as const, error: "This code has expired." };
  }
  const failedAttempts = typeof otpRow.failed_attempts === "number" ? otpRow.failed_attempts : 0;
  if (failedAttempts >= OTP_MAX_FAILED_ATTEMPTS) {
    return { ok: false as const, error: "Too many failed attempts." };
  }
  return { ok: true as const, otpRow };
}

export async function verifyResetOtpCode(supabase: SupabaseClient, email: string, otp: string) {
  if (!OTP_RE.test(otp)) return { ok: false as const, error: "Enter the 6-digit code." };
  const active = await getActiveResetOtp(supabase, email);
  if (!active.ok) return active;
  if (!verifyOtp(otp, email, active.otpRow.code_hash)) {
    const failed = typeof active.otpRow.failed_attempts === "number" ? active.otpRow.failed_attempts : 0;
    await supabase.from("password_reset_otps").update({ failed_attempts: failed + 1 }).eq("id", active.otpRow.id);
    return { ok: false as const, error: failed + 1 >= OTP_MAX_FAILED_ATTEMPTS ? "Too many attempts." : "Incorrect code." };
  }
  return { ok: true as const, otpRow: active.otpRow };
}
