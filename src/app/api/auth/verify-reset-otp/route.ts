import { createAdminClient } from "@/lib/supabase/admin";
import { EMAIL_RE, verifyResetOtpCode } from "@/lib/passwordReset";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const otp = String(body.otp ?? "").trim();

    const limited = enforceRateLimit(request, "verify-reset-otp", 10, 15 * 60 * 1000, email);
    if (limited) return limited;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const result = await verifyResetOtpCode(supabase, email, otp);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Verify reset OTP error:", err);
    const message = err instanceof Error ? err.message : "Could not verify code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
