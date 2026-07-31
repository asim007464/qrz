import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

type ProfilePeek = {
  id: string;
  callsign: string | null;
  name: string | null;
  avatar_url: string | null;
};

function peerFromConversation(
  row: { participant_a: string; participant_b: string; a?: ProfilePeek | ProfilePeek[] | null; b?: ProfilePeek | ProfilePeek[] | null },
  userId: string,
): ProfilePeek | null {
  const a = Array.isArray(row.a) ? row.a[0] : row.a;
  const b = Array.isArray(row.b) ? row.b[0] : row.b;
  if (row.participant_a === userId) return b ?? null;
  return a ?? null;
}

/** List inbox conversations for the signed-in user. */
export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("conversations")
    .select(
      `id, participant_a, participant_b, last_message_at, last_message_preview, created_at,
       a:participant_a(id, callsign, name, avatar_url),
       b:participant_b(id, callsign, name, avatar_url)`,
    )
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const conversations = await Promise.all(
    (data ?? []).map(async (row) => {
      const peer = peerFromConversation(row, user.id);
      const { count } = await admin
        .from("direct_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", row.id)
        .neq("sender_id", user.id)
        .is("read_at", null);

      return {
        id: row.id,
        lastMessageAt: row.last_message_at,
        lastMessagePreview: row.last_message_preview,
        unreadCount: count ?? 0,
        peer: peer
          ? {
              id: peer.id,
              callsign: peer.callsign || "",
              name: peer.name || peer.callsign || "",
              avatar: peer.avatar_url,
            }
          : null,
      };
    }),
  );

  return NextResponse.json({ conversations });
}

/**
 * Open or create a conversation with a callsign.
 * Optional body text sends the first message.
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const callsign = String(body.callsign ?? "").trim();
  const message = String(body.body ?? body.message ?? "").trim();

  if (!callsign) {
    return NextResponse.json({ error: "Callsign is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: peer } = await admin
    .from("profiles")
    .select("id, callsign, name, avatar_url")
    .ilike("callsign", callsign)
    .maybeSingle();

  if (!peer?.id) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (peer.id === user.id) {
    return NextResponse.json({ error: "You cannot message yourself." }, { status: 400 });
  }

  const [participant_a, participant_b] = orderedPair(user.id, peer.id);

  let { data: conversation } = await admin
    .from("conversations")
    .select("id, participant_a, participant_b, last_message_at, last_message_preview")
    .eq("participant_a", participant_a)
    .eq("participant_b", participant_b)
    .maybeSingle();

  if (!conversation) {
    const { data: created, error: createError } = await admin
      .from("conversations")
      .insert({ participant_a, participant_b })
      .select("id, participant_a, participant_b, last_message_at, last_message_preview")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }
    conversation = created;
  }

  let sentMessage = null;
  if (message) {
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });
    }

    const preview = message.length > 120 ? `${message.slice(0, 117)}…` : message;
    const { data: msg, error: msgError } = await admin
      .from("direct_messages")
      .insert({
        conversation_id: conversation!.id,
        sender_id: user.id,
        body: message,
      })
      .select("id, conversation_id, sender_id, body, created_at, read_at")
      .single();

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 400 });
    }

    await admin
      .from("conversations")
      .update({ last_message_at: msg.created_at, last_message_preview: preview })
      .eq("id", conversation!.id);

    sentMessage = msg;
  }

  return NextResponse.json(
    {
      conversation: {
        id: conversation!.id,
        peer: {
          id: peer.id,
          callsign: peer.callsign || callsign,
          name: peer.name || peer.callsign || callsign,
          avatar: peer.avatar_url,
        },
      },
      message: sentMessage,
    },
    { status: sentMessage ? 201 : 200 },
  );
}
