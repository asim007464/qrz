import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status, reply } = body;

  if (!id) {
    return NextResponse.json({ error: "Message id is required." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status === "open" || status === "replied" || status === "closed") {
    updates.status = status;
  }
  if (typeof reply === "string") {
    updates.admin_reply = reply;
    if (!updates.status) updates.status = "replied";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_messages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
