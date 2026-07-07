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

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const direction = searchParams.get("direction") || "all";

  const admin = createAdminClient();
  let query = admin
    .from("qsl_cards")
    .select("*, qsl_templates(name, background_color, accent_color, border_color, background_image)")
    .order("created_at", { ascending: false });

  if (direction === "sent") {
    query = query.eq("from_user_id", user.id);
  } else if (direction === "received") {
    query = query.eq("to_user_id", user.id);
  } else {
    query = query.or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const toCallsign = String(body.to_callsign ?? body.toCallsign ?? "").trim().toUpperCase();

  if (!toCallsign) {
    return NextResponse.json({ error: "Recipient callsign is required." }, { status: 400 });
  }

  const admin = createAdminClient();

  const [{ data: sender }, { data: recipient }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, name, callsign, location, country, itu_zone, cards_sent")
      .eq("id", user.id)
      .single(),
    admin.from("profiles").select("id, callsign, cards_received").ilike("callsign", toCallsign).maybeSingle(),
  ]);

  if (!sender) {
    return NextResponse.json({ error: "Sender profile not found." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("qsl_cards")
    .insert({
      template_id: body.template_id ?? body.templateId ?? null,
      from_user_id: user.id,
      to_user_id: recipient?.id ?? null,
      from_callsign: sender.callsign || sender.name,
      to_callsign: toCallsign,
      from_name: body.from_name ?? body.fromName ?? sender.name,
      from_address: body.from_address ?? body.fromAddress ?? sender.location,
      from_country: body.from_country ?? body.fromCountry ?? sender.country,
      itu_zone: body.itu_zone ?? body.ituZone ?? sender.itu_zone,
      qso_date: body.qso_date ?? body.qsoDate ?? body.date ?? null,
      qso_utc: String(body.qso_utc ?? body.qsoUtc ?? body.utc ?? ""),
      mhz: String(body.mhz ?? ""),
      mode: String(body.mode ?? ""),
      rst: String(body.rst ?? ""),
      qsl_via: String(body.qsl_via ?? body.qslVia ?? ""),
      status: body.status ?? "pending",
      background_image: body.background_image ?? body.backgroundImage ?? null,
      thumbnail: body.thumbnail ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin
    .from("profiles")
    .update({ cards_sent: (sender.cards_sent ?? 0) + 1 })
    .eq("id", user.id);

  if (recipient?.id) {
    await admin
      .from("profiles")
      .update({ cards_received: (recipient.cards_received ?? 0) + 1 })
      .eq("id", recipient.id);
  }

  return NextResponse.json(data, { status: 201 });
}
