import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { authMetadataIsBloated, compactAuthMetadata } from "@/lib/authMetadata";
import { resolveRequestIpGeo } from "@/lib/ipGeo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.slice(7));
    return user ?? null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

async function trackUserIp(userId: string, request: Request) {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("last_ip, last_ip_location, last_ip_at")
    .eq("id", userId)
    .maybeSingle();

  const ipGeo = await resolveRequestIpGeo(request);
  if (!ipGeo?.ip) return;

  const lastAt = profile?.last_ip_at ? new Date(profile.last_ip_at).getTime() : 0;
  const recentlyTracked = Date.now() - lastAt < 15 * 60 * 1000;
  if (recentlyTracked && profile?.last_ip === ipGeo.ip && profile?.last_ip_location) {
    return;
  }

  const location =
    ipGeo.location ??
    (profile?.last_ip === ipGeo.ip ? profile.last_ip_location : null) ??
    null;

  await admin
    .from("profiles")
    .update({
      last_ip: ipGeo.ip,
      last_ip_location: location,
      last_ip_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

/** Remove large fields (e.g. base64 avatars) from auth user_metadata and track last IP. */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  void trackUserIp(user.id, request).catch((err) => {
    console.error("IP tracking error:", err);
  });

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  if (!authMetadataIsBloated(metadata)) {
    return NextResponse.json({ ok: true, cleaned: false });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: compactAuthMetadata(metadata),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cleaned: true });
}
