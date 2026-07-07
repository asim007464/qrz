import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notifyAdminEmail, sendAdminSupportNotificationEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Support is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();
    const name = String(body.name ?? body.user_name ?? "").trim() || "Guest";
    const email = String(body.email ?? "").trim();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Guest submission is allowed
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("support_messages")
      .insert({
        user_id: userId,
        name,
        email,
        subject,
        message,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      console.error("[support] insert failed:", error.message);
      return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
    }

    await notifyAdminEmail((to) =>
      sendAdminSupportNotificationEmail({
        to,
        userName: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      })
    );

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[support] POST error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
