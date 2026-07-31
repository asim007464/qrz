"use client";

import { FormEvent, use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { avatarForCallsign } from "@/lib/profileDefaults";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Peer = {
  id: string;
  callsign: string;
  name: string;
  avatar: string | null;
};

type ChatMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function ConversationPage({ params }: Props) {
  const { id: conversationId } = use(params);
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [peer, setPeer] = useState<Peer | null>(null);
  const [meId, setMeId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading || !conversationId) return;
    if (!isLoggedIn) {
      router.replace(`/login?next=/messages/${conversationId}`);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.replace(`/login?next=/messages/${conversationId}`);
        return;
      }

      const res = await fetch(`/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error || "Could not load conversation.");
        setLoading(false);
        return;
      }
      setPeer(data.conversation?.peer || null);
      setMessages(data.messages || []);
      setMeId(data.meId || "");
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, conversationId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !conversationId || sending) return;

    setSending(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.replace(`/login?next=/messages/${conversationId}`);
        return;
      }

      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not send message.");
        return;
      }
      setMessages((prev) => [...prev, data.message]);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  const title = peer?.callsign || "Messages";

  return (
    <AppShell>
      <PageHeader title={title} backHref="/messages" />

      {peer && (
        <Link
          href={`/profile/${encodeURIComponent(peer.callsign)}`}
          className="flex items-center gap-3 mb-4 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 card-shadow"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarForCallsign(peer.callsign, peer.avatar)}
            alt={peer.callsign}
            className="w-10 h-10 rounded-full object-cover bg-gray-100"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{peer.name}</p>
            <p className="text-xs text-ham-purple font-medium">{peer.callsign}</p>
          </div>
        </Link>
      )}

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="rounded-2xl border border-gray-100 bg-white card-shadow flex flex-col min-h-[420px] max-h-[min(70vh,640px)]">
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {loading && <p className="text-sm text-gray-500 text-center py-8">Loading…</p>}
          {!loading && !messages.length && (
            <p className="text-sm text-gray-500 text-center py-8">
              No messages yet. Say hello to start the conversation.
            </p>
          )}
          {messages.map((msg) => {
            const mine = msg.sender_id === meId;
            return (
              <div key={msg.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
                    mine
                      ? "bg-ham-purple text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md",
                  )}
                >
                  {msg.body}
                  <div
                    className={cn(
                      "text-[10px] mt-1",
                      mine ? "text-white/70 text-right" : "text-gray-400",
                    )}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => void send(e)}
          className="border-t border-gray-100 p-3 flex gap-2 items-end"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Write a message…"
            className="flex-1 min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-ham-purple resize-none no-cap"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="submit"
            disabled={sending || !draft.trim()}
            className="shrink-0 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            {sending ? "…" : "Send"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
