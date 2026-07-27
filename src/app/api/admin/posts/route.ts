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
    .from("feed_posts")
    .select(
      "id, content, image_url, created_at, user_id, profiles(id, name, callsign, email, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posts = (data || []).map((post) => {
    const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
    return {
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      author: profile
        ? {
            id: profile.id,
            name: profile.name,
            callsign: profile.callsign,
            email: profile.email,
            avatar_url: profile.avatar_url,
          }
        : null,
    };
  });

  return NextResponse.json(posts);
}
