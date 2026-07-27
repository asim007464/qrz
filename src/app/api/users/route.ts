import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { avatarForCallsign } from "@/lib/profileDefaults";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select(
      "id, callsign, name, avatar_url, location, country, on_air, profile_views, cards_received, latitude, longitude"
    )
    .eq("is_blocked", false)
    .neq("callsign", "")
    .order("callsign", { ascending: true })
    .limit(limit);

  if (q) {
    const pattern = `%${q}%`;
    query = query.or(
      `callsign.ilike.${pattern},name.ilike.${pattern},location.ilike.${pattern},country.ilike.${pattern}`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const users = (data || []).map((row) => ({
    id: row.id,
    callsign: row.callsign,
    name: row.name || row.callsign,
    avatar: avatarForCallsign(row.callsign, row.avatar_url),
    location: row.location || "",
    country: row.country || "",
    onAir: Boolean(row.on_air),
    profileViews: row.profile_views ?? 0,
    cardsReceived: row.cards_received ?? 0,
    latitude: row.latitude,
    longitude: row.longitude,
  }));

  return NextResponse.json(users);
}
