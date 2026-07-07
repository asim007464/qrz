import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmEmailWithOtp, EMAIL_RE } from "@/lib/emailVerification";
import { notifyAdminEmail, sendAdminRegistrationNotificationEmail } from "@/lib/mail";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const otp = String(body.otp ?? "").trim();

    const limited = enforceRateLimit(request, "verify-registration-otp", 10, 15 * 60 * 1000, email);
    if (limited) return limited;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const result = await confirmEmailWithOtp(supabase, email, otp);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("email", email)
      .maybeSingle();

    await notifyAdminEmail((to) =>
      sendAdminRegistrationNotificationEmail({
        to,
        displayName: profile?.name || email.split("@")[0],
        email: profile?.email || email,
      })
    );

    return NextResponse.json({
      ok: true,
      message: "Email verified! You can sign in now.",
    });
  } catch (err) {
    console.error("Verify registration OTP error:", err);
    const message = err instanceof Error ? err.message : "Could not verify code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
