import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ id: string }> };

async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.slice(7));
    return user ?? null;
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

async function getOwnedConversation(admin: ReturnType<typeof createAdminClient>, conversationId: string, userId: string) {
  const { data } = await admin
    .from("conversations")
    .select(
      `id, participant_a, participant_b, last_message_at, last_message_preview,
       a:participant_a(id, callsign, name, avatar_url),
       b:participant_b(id, callsign, name, avatar_url)`,
    )
    .eq("id", conversationId)
    .maybeSingle();

  if (!data) return null;
  if (data.participant_a !== userId && data.participant_b !== userId) return null;
  return data;
}

function pickPeer(
  row: {
    participant_a: string;
    participant_b: string;
    a?: { id: string; callsign: string | null; name: string | null; avatar_url: string | null } | { id: string; callsign: string | null; name: string | null; avatar_url: string | null }[] | null;
    b?: { id: string; callsign: string | null; name: string | null; avatar_url: string | null } | { id: string; callsign: string | null; name: string | null; avatar_url: string | null }[] | null;
  },
  userId: string,
) {
  const a = Array.isArray(row.a) ? row.a[0] : row.a;
  const b = Array.isArray(row.b) ? row.b[0] : row.b;
  const peer = row.participant_a === userId ? b : a;
  if (!peer) return null;
  return {
    id: peer.id,
    callsign: peer.callsign || "",
    name: peer.name || peer.callsign || "",
    avatar: peer.avatar_url,
  };
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const admin = createAdminClient();
  const conversation = await getOwnedConversation(admin, id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const { data: messages, error } = await admin
    .from("direct_messages")
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin
    .from("direct_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      peer: pickPeer(conversation, user.id),
    },
    messages: messages ?? [],
    meId: user.id,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const admin = createAdminClient();
  const conversation = await getOwnedConversation(admin, id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const text = String(body.body ?? body.message ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });
  }

  const preview = text.length > 120 ? `${text.slice(0, 117)}…` : text;
  const { data: msg, error } = await admin
    .from("direct_messages")
    .insert({
      conversation_id: id,
      sender_id: user.id,
      body: text,
    })
    .select("id, conversation_id, sender_id, body, created_at, read_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin
    .from("conversations")
    .update({ last_message_at: msg.created_at, last_message_preview: preview })
    .eq("id", id);

  return NextResponse.json({ message: msg }, { status: 201 });
}
