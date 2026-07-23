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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id: postId } = await context.params;
  const admin = createAdminClient();

  const { data: post } = await admin.from("feed_posts").select("id").eq("id", postId).maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("feed_replies")
    .select("id, content, created_at, user_id, profiles(id, name, callsign, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const replies = (data || []).map((reply) => {
    const profile = Array.isArray(reply.profiles) ? reply.profiles[0] : reply.profiles;
    return {
      id: reply.id,
      content: reply.content,
      created_at: reply.created_at,
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

  return NextResponse.json(replies);
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await context.params;
  const body = await request.json();
  const content = String(body.content ?? "").trim();

  if (!content) {
    return NextResponse.json({ error: "Reply content is required." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: post } = await admin.from("feed_posts").select("id").eq("id", postId).maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { data, error } = await admin
    .from("feed_replies")
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select("id, content, created_at, user_id")
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
