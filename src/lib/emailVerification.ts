import type { SupabaseClient } from "@supabase/supabase-js";
import { generateOtpCode, hashOtp, verifyOtp } from "@/lib/otp";
import { findAccountByEmail, EMAIL_RE, OTP_RE, OTP_TTL_MS, OTP_MAX_FAILED_ATTEMPTS } from "@/lib/passwordReset";
import { compactAuthMetadata } from "@/lib/authMetadata";
import { sendRegistrationOtpEmail } from "@/lib/mail";

export { EMAIL_RE, OTP_RE };

async function getActiveVerificationOtp(supabase: SupabaseClient, email: string) {
  const { data: otpRow, error: otpError } = await supabase
    .from("email_verification_otps")
    .select("id, code_hash, expires_at, used_at, failed_attempts")
    .eq("email", email)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    if (otpError.code === "42P01") throw new Error("Run email_verification_otps migration in Supabase.");
    throw otpError;
  }
  if (!otpRow) return { ok: false as const, error: "Invalid or expired code. Request a new one." };
  if (otpRow.used_at || new Date(otpRow.expires_at) < new Date()) {
    return { ok: false as const, error: "This code has expired. Request a new one." };
  }
  const failedAttempts = typeof otpRow.failed_attempts === "number" ? otpRow.failed_attempts : 0;
  if (failedAttempts >= OTP_MAX_FAILED_ATTEMPTS) {
    return { ok: false as const, error: "Too many failed attempts. Request a new code." };
  }
  return { ok: true as const, otpRow };
}

export async function issueEmailVerificationOtp(supabase: SupabaseClient, email: string, displayName?: string) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  await supabase.from("email_verification_otps").delete().eq("email", email);
  const { error: insertError } = await supabase.from("email_verification_otps").insert({
    email,
    code_hash: hashOtp(code, email),
    expires_at: expiresAt,
  });
  if (insertError) throw new Error("Could not create verification code.");
  try {
    await sendRegistrationOtpEmail({ to: email, displayName: displayName || "there", code });
    return { ok: true as const, emailSent: true as const };
  } catch (err) {
    // Email sending is an external dependency (SMTP). Don't hard-fail account creation
    // if email delivery is temporarily unavailable.
    console.error("Registration OTP email error:", err);
    return { ok: true as const, emailSent: false as const };
  }
}

export async function verifyEmailOtpCode(supabase: SupabaseClient, email: string, otp: string) {
  if (!OTP_RE.test(otp)) return { ok: false as const, error: "Enter the 6-digit code from your email." };
  const active = await getActiveVerificationOtp(supabase, email);
  if (!active.ok) return active;
  if (!verifyOtp(otp, email, active.otpRow.code_hash)) {
    const failed = typeof active.otpRow.failed_attempts === "number" ? active.otpRow.failed_attempts : 0;
    await supabase.from("email_verification_otps").update({ failed_attempts: failed + 1 }).eq("id", active.otpRow.id);
    return { ok: false as const, error: failed + 1 >= OTP_MAX_FAILED_ATTEMPTS ? "Too many failed attempts." : "Incorrect code." };
  }
  return { ok: true as const, otpRow: active.otpRow };
}

export async function confirmEmailWithOtp(supabase: SupabaseClient, email: string, otp: string) {
  const otpResult = await verifyEmailOtpCode(supabase, email, otp);
  if (!otpResult.ok) return otpResult;
  const account = await findAccountByEmail(supabase, email);
  if (!account) return { ok: false as const, error: "Account not found." };

  const { data: authUser } = await supabase.auth.admin.getUserById(account.id);
  const metadata = (authUser?.user?.user_metadata || {}) as Record<string, unknown>;

  const { error: confirmError } = await supabase.auth.admin.updateUserById(account.id, {
    email_confirm: true,
    user_metadata: compactAuthMetadata(metadata),
  });
  if (confirmError) return { ok: false as const, error: "Could not verify email." };
  await supabase.from("email_verification_otps").update({ used_at: new Date().toISOString() }).eq("id", otpResult.otpRow.id);
  return { ok: true as const };
}
