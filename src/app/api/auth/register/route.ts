import { createAdminClient } from "@/lib/supabase/admin";
import { resolveUserRole } from "@/lib/admin";
import { checkPassword } from "@/lib/passwordUtils";
import { issueEmailVerificationOtp } from "@/lib/emailVerification";
import { toMailUserError } from "@/lib/mail";
import { getAuthCallbackUrl } from "@/lib/siteUrl";
import { enforceRateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CALLSIGN_RE = /^[A-Z0-9/\-]{3,12}$/i;

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "register", 5, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await request.json();
    const displayName = String(body.displayName ?? "").trim();
    const callsign = String(body.callsign ?? "").trim().toUpperCase();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!displayName) {
      return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    }
    if (!callsign) {
      return NextResponse.json({ error: "Callsign is required." }, { status: 400 });
    }
    if (!CALLSIGN_RE.test(callsign)) {
      return NextResponse.json({ error: "Enter a valid callsign (3–12 characters)." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!checkPassword(password).passed) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with upper, lower, number, and symbol." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existingCallsign } = await supabase
      .from("profiles")
      .select("id")
      .ilike("callsign", callsign)
      .maybeSingle();

    if (existingCallsign) {
      return NextResponse.json({ error: "This callsign is already registered." }, { status: 409 });
    }

    const redirectTo = getAuthCallbackUrl();
    const role = resolveUserRole(email);

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo,
        data: { display_name: displayName, callsign },
      },
    });

    if (linkError) {
      const msg = linkError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      throw linkError;
    }

    const userId = linkData.user?.id;
    if (!userId) {
      throw new Error("Failed to create account.");
    }

    const { error: unconfirmError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: false,
    });
    if (unconfirmError) {
      console.error("Unconfirm email error:", unconfirmError);
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      name: displayName,
      callsign,
      email,
      role,
    });

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      throw new Error("Account was created but profile setup failed. Please contact support.");
    }

    await issueEmailVerificationOtp(supabase, email, displayName);

    return NextResponse.json({
      ok: true,
      requiresVerification: true,
      email,
      message: "Account created. Enter the 6-digit code sent to your email to complete registration.",
    });
  } catch (err) {
    console.error("Register API error:", err);
    const raw = err instanceof Error ? err.message : "Registration failed.";
    const message =
      raw.toLowerCase().includes("535") ||
      raw.toLowerCase().includes("badcredentials") ||
      raw.toLowerCase().includes("smtp") ||
      raw.toLowerCase().includes("smtp_email")
        ? toMailUserError(err)
        : raw.includes("email_verification_otps") || raw.includes("not configured")
          ? "Email verification is not set up on the server. Run migration 001 in Supabase."
          : raw;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
