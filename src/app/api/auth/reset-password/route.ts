import { createAdminClient } from "@/lib/supabase/admin";
import { checkPassword } from "@/lib/passwordUtils";
import {
  EMAIL_RE,
  OTP_RE,
  findAccountByEmail,
  verifyResetOtpCode,
} from "@/lib/passwordReset";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const otp = String(body.otp ?? "").trim();
    const password = String(body.password ?? "");

    const limited = enforceRateLimit(request, "reset-password", 10, 15 * 60 * 1000, email);
    if (limited) return limited;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!OTP_RE.test(otp)) {
      return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
    }
    if (!checkPassword(password).passed) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with upper, lower, number, and symbol." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const otpResult = await verifyResetOtpCode(supabase, email, otp);

    if (!otpResult.ok) {
      return NextResponse.json({ error: otpResult.error }, { status: 400 });
    }

    const account = await findAccountByEmail(supabase, email);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(account.id, {
      password,
    });

    if (updateError) throw updateError;

    await supabase
      .from("password_reset_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpResult.otpRow.id);

    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch (err) {
    console.error("Reset password error:", err);
    const message = err instanceof Error ? err.message : "Could not reset password.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
