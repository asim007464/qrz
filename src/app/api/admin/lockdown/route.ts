import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";
import { DEFAULT_LOCKDOWN } from "@/lib/siteSettings";

export async function POST(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const enabled = Boolean(body.enabled ?? true);
  const message =
    String(body.message ?? "").trim() || DEFAULT_LOCKDOWN.message;

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    key: "lockdown",
    value: { enabled, message },
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enabled, message });
}

export async function DELETE(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "lockdown")
    .maybeSingle();

  const message =
    (existing?.value as { message?: string } | null)?.message ||
    DEFAULT_LOCKDOWN.message;

  const { error } = await admin.from("site_settings").upsert({
    key: "lockdown",
    value: { enabled: false, message },
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, enabled: false });
}
