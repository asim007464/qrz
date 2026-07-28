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
    const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));
    if (error || !user) return null;
    return user;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

const HRDLOG_CALLSIGN_RE = /^[A-Z0-9/-]{3,16}$/i;

const PROFILE_FIELDS =
  "id, name, callsign, email, bio, avatar_url, location, country, itu_zone, active_band, active_frequency, active_mode, cq_zone, grid, station_setup, antenna_setup, qsl_info, bio_image, station_setup_image, antenna_setup_image, qsl_info_image, phone, website, qrz, hrdlog_callsign, latitude, longitude, on_air, background_image, social_links, role, is_blocked, profile_views, profile_searches, cards_received, cards_sent, created_at, updated_at";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  if (data.is_blocked) {
    return NextResponse.json({ error: "Account blocked." }, { status: 403 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const fieldMap: Record<string, string> = {
    name: "name",
    callsign: "callsign",
    bio: "bio",
    avatar_url: "avatar_url",
    avatarUrl: "avatar_url",
    location: "location",
    country: "country",
    itu_zone: "itu_zone",
    ituZone: "itu_zone",
    active_band: "active_band",
    activeBand: "active_band",
    active_frequency: "active_frequency",
    activeFrequency: "active_frequency",
    active_mode: "active_mode",
    activeMode: "active_mode",
    cq_zone: "cq_zone",
    cqZone: "cq_zone",
    grid: "grid",
    station_setup: "station_setup",
    stationSetup: "station_setup",
    antenna_setup: "antenna_setup",
    antennaSetup: "antenna_setup",
    qsl_info: "qsl_info",
    qslInfo: "qsl_info",
    bio_image: "bio_image",
    bioImage: "bio_image",
    station_setup_image: "station_setup_image",
    stationSetupImage: "station_setup_image",
    antenna_setup_image: "antenna_setup_image",
    antennaSetupImage: "antenna_setup_image",
    qsl_info_image: "qsl_info_image",
    qslInfoImage: "qsl_info_image",
    phone: "phone",
    website: "website",
    qrz: "qrz",
    hrdlog_callsign: "hrdlog_callsign",
    hrdlogCallsign: "hrdlog_callsign",
    latitude: "latitude",
    longitude: "longitude",
    on_air: "on_air",
    onAir: "on_air",
    background_image: "background_image",
    backgroundImage: "background_image",
    social_links: "social_links",
    socialLinks: "social_links",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (body[key] !== undefined) {
      updates[column] = body[key];
    }
  }

  if (updates.hrdlog_callsign !== undefined) {
    const raw = String(updates.hrdlog_callsign ?? "").trim().toUpperCase();
    if (raw && !HRDLOG_CALLSIGN_RE.test(raw)) {
      return NextResponse.json({ error: "Invalid HRDLOG callsign." }, { status: 400 });
    }
    updates.hrdlog_callsign = raw;
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "No valid updates." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select(PROFILE_FIELDS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
