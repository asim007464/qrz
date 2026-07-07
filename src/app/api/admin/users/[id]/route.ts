import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.is_blocked === "boolean") {
    updates.is_blocked = body.is_blocked;
  }

  if (body.role === "member" || body.role === "staff") {
    updates.role = body.role;
  }

  if (body.role === "admin") {
    if (!session.isSuperAdmin) {
      return NextResponse.json(
        { error: "Only the developer super-admin can create other admins." },
        { status: 403 }
      );
    }
    updates.role = "admin";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates." }, { status: 400 });
  }

  if (id === session.profile.id && updates.is_blocked === true) {
    return NextResponse.json({ error: "You cannot block your own account." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select("id, name, email, callsign, role, is_blocked, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, user: data });
}
