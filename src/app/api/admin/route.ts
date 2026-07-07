import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [usersRes, supportRes, qslRes, broadcastsRes, recentSupportRes] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "open"),
    admin.from("qsl_cards").select("id", { count: "exact", head: true }),
    admin.from("broadcasts").select("*").order("created_at", { ascending: false }).limit(10),
    admin
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers: usersRes.count ?? 0,
      openSupport: supportRes.count ?? 0,
      totalQslCards: qslRes.count ?? 0,
    },
    broadcasts: broadcastsRes.data || [],
    recentSupport: recentSupportRes.data || [],
    session: {
      isSuperAdmin: session.isSuperAdmin,
      name: session.profile.name,
      email: session.profile.email,
    },
  });
}
