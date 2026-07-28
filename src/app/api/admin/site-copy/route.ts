import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";
import {
  DEFAULT_SITE_COPY,
  allSiteCopyKeys,
  mergeSiteCopy,
  type SiteCopyMap,
} from "@/lib/siteCopy";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "site_copy")
    .maybeSingle();

  return NextResponse.json({
    copy: mergeSiteCopy((data?.value || {}) as SiteCopyMap),
    defaults: DEFAULT_SITE_COPY,
  });
}

export async function PUT(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const incoming = (body.copy || {}) as SiteCopyMap;
  const allowed = new Set(allSiteCopyKeys());
  const cleaned: SiteCopyMap = {};

  for (const key of allowed) {
    const value = incoming[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    // Persist empty strings as empty so admin can clear; merge fills defaults at read time only for missing keys.
    // If empty, store default so public always has a usable string.
    cleaned[key] = trimmed || DEFAULT_SITE_COPY[key] || "";
  }

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    key: "site_copy",
    value: cleaned,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, copy: mergeSiteCopy(cleaned) });
}
