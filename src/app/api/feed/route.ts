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
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feed_posts")
    .select("id, content, image_url, created_at, user_id, profiles(id, name, callsign, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posts = (data || []).map((post) => {
    const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
    return {
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      user: profile
        ? {
            id: profile.id,
            name: profile.name,
            callsign: profile.callsign,
            avatar_url: profile.avatar_url,
          }
        : null,
    };
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const content = String(body.content ?? "").trim();
  const imageUrl = body.image_url ?? body.imageUrl ?? null;
  const image =
    typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;

  if (!content && !image) {
    return NextResponse.json(
      { error: "Add text, an image, or both to publish." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feed_posts")
    .insert({
      user_id: user.id,
      content,
      image_url: image,
    })
    .select("id, content, image_url, created_at, user_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: profile } = await admin
    .from("profiles")
    .select("id, name, callsign, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json(
    {
      ...data,
      user: profile,
    },
    { status: 201 }
  );
}
