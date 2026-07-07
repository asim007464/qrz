import { createAdminClient } from "@/lib/supabase/admin";
import { issueEmailVerificationOtp } from "@/lib/emailVerification";
import { toMailUserError } from "@/lib/mail";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    const limited = enforceRateLimit(request, "resend-verify", 5, 60 * 60 * 1000, email);
    if (limited) return limited;

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find((u) => u.email?.toLowerCase() === email);
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "If that account exists, a new verification code was sent.",
      });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "This email is already verified. You can sign in." }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    const displayName =
      (user.user_metadata?.display_name as string | undefined) || profile?.name || "there";

    await issueEmailVerificationOtp(supabase, email, displayName);

    return NextResponse.json({
      ok: true,
      message: "A new 6-digit verification code was sent to your email.",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json({ error: toMailUserError(err) }, { status: 500 });
  }
}
