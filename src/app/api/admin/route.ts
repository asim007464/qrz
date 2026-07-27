import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";
import { DEFAULT_LOCKDOWN, type LockdownSettings } from "@/lib/siteSettings";

function mapSupportRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    user_name: row.name ?? "",
    callsign: row.callsign ?? "",
    email: row.email ?? "",
    subject: row.subject ?? "",
    message: row.message ?? "",
    status: row.status ?? "open",
    reply: row.admin_reply ?? "",
    created_at: row.created_at,
  };
}

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [
    usersRes,
    supportRes,
    templatesRes,
    postsRes,
    qslRes,
    lockdownRes,
    onlineRes,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, name, callsign, email, role, is_blocked, created_at")
      .order("created_at", { ascending: false }),
    admin.from("support_messages").select("*").order("created_at", { ascending: false }),
    admin.from("qsl_templates").select("*").order("created_at", { ascending: false }),
    admin.from("feed_posts").select("id", { count: "exact", head: true }),
    admin.from("qsl_cards").select("id", { count: "exact", head: true }),
    admin.from("site_settings").select("value").eq("key", "lockdown").maybeSingle(),
    admin
      .from("profiles")
      .select("name, callsign")
      .eq("on_air", true)
      .limit(20),
  ]);

  const lockdownValue = (lockdownRes.data?.value || DEFAULT_LOCKDOWN) as LockdownSettings;
  const openSupport = (supportRes.data || []).filter((m) => m.status === "open").length;

  return NextResponse.json({
    users: usersRes.data || [],
    support: (supportRes.data || []).map(mapSupportRow),
    templates: templatesRes.data || [],
    online: (onlineRes.data || []).map((p) => ({
      name: p.name,
      callsign: p.callsign,
      page: "On air",
      last_seen: new Date().toISOString(),
    })),
    lockdown: {
      enabled: Boolean(lockdownValue.enabled),
      message: lockdownValue.message || DEFAULT_LOCKDOWN.message,
    },
    stats: {
      totalUsers: usersRes.data?.length ?? 0,
      openSupport,
      totalTemplates: templatesRes.data?.length ?? 0,
      totalPosts: postsRes.count ?? 0,
      totalQslCards: qslRes.count ?? 0,
      onlineNow: onlineRes.data?.length ?? 0,
    },
    session: {
      isSuperAdmin: session.isSuperAdmin,
      name: session.profile.name,
      email: session.profile.email,
    },
  });
}
