import { createAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetOtpEmail, toMailUserError } from "@/lib/mail";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { EMAIL_RE, OTP_TTL_MS, findAccountByEmail } from "@/lib/passwordReset";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    const limited = enforceRateLimit(request, "forgot-password", 5, 15 * 60 * 1000, email);
    if (limited) return limited;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const account = await findAccountByEmail(supabase, email);

    if (account) {
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

      await supabase.from("password_reset_otps").delete().eq("email", email);

      const { error: insertError } = await supabase.from("password_reset_otps").insert({
        email,
        code_hash: hashOtp(code, email),
        expires_at: expiresAt,
      });

      if (insertError) {
        console.error("OTP insert error:", insertError);
        throw new Error("Could not create reset code.");
      }

      void sendPasswordResetOtpEmail({ to: email, code }).catch((emailErr) => {
        console.error("Reset OTP email error:", emailErr);
      });
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for this email, a 6-digit code has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    const raw = err instanceof Error ? err.message : "Could not send reset code.";
    const lower = raw.toLowerCase();
    const message =
      lower.includes("password_reset_otps") || lower.includes("not configured")
        ? raw
        : lower.includes("smtp") || lower.includes("535")
          ? toMailUserError(err)
          : raw;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
