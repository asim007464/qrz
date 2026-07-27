import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { haversineKm } from "@/lib/geocode";
import { avatarForCallsign } from "@/lib/profileDefaults";

export type MapOperator = {
  id: string;
  callsign: string;
  name: string;
  avatar: string;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  onAir: boolean;
  distanceKm?: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const excludeId = searchParams.get("exclude") || "";
  const nearLat = parseFloat(searchParams.get("lat") || "");
  const nearLng = parseFloat(searchParams.get("lng") || "");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, callsign, name, avatar_url, location, country, latitude, longitude, on_air, is_blocked, created_at"
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .eq("is_blocked", false)
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let operators: MapOperator[] = (data || [])
    .filter((row) => row.callsign && row.id !== excludeId)
    .map((row) => ({
      id: row.id,
      callsign: row.callsign,
      name: row.name || row.callsign,
      avatar: avatarForCallsign(row.callsign, row.avatar_url),
      location: row.location || "",
      country: row.country || "",
      latitude: row.latitude as number,
      longitude: row.longitude as number,
      onAir: Boolean(row.on_air),
    }));

  if (Number.isFinite(nearLat) && Number.isFinite(nearLng)) {
    operators = operators
      .map((op) => ({
        ...op,
        distanceKm: haversineKm(nearLat, nearLng, op.latitude, op.longitude),
      }))
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  return NextResponse.json(operators.slice(0, limit));
}
