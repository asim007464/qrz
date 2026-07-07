import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser(authHeader.slice(7));
    return user ?? null;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "following";

  const admin = createAdminClient();
  const col = type === "followers" ? "following_id" : "follower_id";
  const { data, error } = await admin
    .from("network_follows")
    .select(`id, status, created_at, follower:follower_id(id, callsign, name, avatar_url), following:following_id(id, callsign, name, avatar_url)`)
    .eq(col, user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const followingId = body.following_id as string | undefined;
  const callsign = String(body.callsign ?? "").trim();

  const admin = createAdminClient();
  let targetId = followingId;

  if (!targetId && callsign) {
    const { data: profile } = await admin.from("profiles").select("id").ilike("callsign", callsign).maybeSingle();
    targetId = profile?.id;
  }

  if (!targetId) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (targetId === user.id) return NextResponse.json({ error: "Cannot follow yourself." }, { status: 400 });

  const { data, error } = await admin
    .from("network_follows")
    .upsert({ follower_id: user.id, following_id: targetId, status: "following" }, { onConflict: "follower_id,following_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const id = body.id as string;
  const status = body.status as string;

  if (!id || !["connected", "following", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("network_follows")
    .update({ status })
    .eq("id", id)
    .eq("following_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
