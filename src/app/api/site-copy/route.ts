import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mergeSiteCopy, type SiteCopyMap } from "@/lib/siteCopy";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "site_copy")
      .maybeSingle();

    const stored = (data?.value || {}) as SiteCopyMap;
    return NextResponse.json({ copy: mergeSiteCopy(stored) });
  } catch (err) {
    console.error("site-copy GET error:", err);
    return NextResponse.json({ copy: mergeSiteCopy(null) });
  }
}
