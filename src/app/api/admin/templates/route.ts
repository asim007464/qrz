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
    .from("qsl_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Template name is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("qsl_templates")
    .insert({
      name,
      background_color: String(body.background_color ?? body.backgroundColor ?? "#1e4d5c"),
      accent_color: String(body.accent_color ?? body.accentColor ?? "#e8652a"),
      border_color: String(body.border_color ?? body.borderColor ?? "#f5e6c8"),
      background_image: body.background_image ?? body.backgroundImage ?? null,
      preview_image: body.preview_image ?? body.previewImage ?? null,
      is_active: body.is_active ?? body.isActive ?? true,
      created_by: session.profile.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "Template id is required." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.background_color !== undefined || body.backgroundColor !== undefined) {
    updates.background_color = body.background_color ?? body.backgroundColor;
  }
  if (body.accent_color !== undefined || body.accentColor !== undefined) {
    updates.accent_color = body.accent_color ?? body.accentColor;
  }
  if (body.border_color !== undefined || body.borderColor !== undefined) {
    updates.border_color = body.border_color ?? body.borderColor;
  }
  if (body.background_image !== undefined || body.backgroundImage !== undefined) {
    updates.background_image = body.background_image ?? body.backgroundImage;
  }
  if (body.preview_image !== undefined || body.previewImage !== undefined) {
    updates.preview_image = body.preview_image ?? body.previewImage;
  }
  if (typeof body.is_active === "boolean" || typeof body.isActive === "boolean") {
    updates.is_active = body.is_active ?? body.isActive;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("qsl_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
