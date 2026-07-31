"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { avatarForCallsign } from "@/lib/profileDefaults";
import { useAuth } from "@/hooks/useAuth";

type InboxItem = {
  id: string;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  unreadCount: number;
  peer: {
    id: string;
    callsign: string;
    name: string;
    avatar: string | null;
  } | null;
};

function MessagesInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toCallsign = (searchParams.get("to") || "").trim();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(Boolean(toCallsign));

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace(
        `/login?next=${encodeURIComponent(toCallsign ? `/messages?to=${toCallsign}` : "/messages")}`,
      );
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
        router.replace("/login?next=/messages");
        return;
      }

      if (toCallsign) {
        setOpening(true);
        const openRes = await fetch("/api/messages", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ callsign: toCallsign }),
        });
        const openData = await openRes.json().catch(() => ({}));
        if (openRes.ok && openData.conversation?.id) {
          router.replace(`/messages/${openData.conversation.id}`);
          return;
        }
        if (!cancelled) {
          setError(openData.error || "Could not open conversation.");
          setOpening(false);
        }
      }

      const res = await fetch("/api/messages", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!cancelled) {
        if (!res.ok) setError(data.error || "Could not load messages.");
        else setItems(data.conversations || []);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, router, toCallsign]);

  return (
    <>
      {error && (
        <Card className="mb-4 border-red-100 bg-red-50 text-sm text-red-700">{error}</Card>
      )}

      {(loading || opening) && (
        <p className="text-sm text-gray-500 py-8 text-center">
          {opening ? "Opening conversation…" : "Loading messages…"}
        </p>
      )}

      {!loading && !opening && !items.length && !error && (
        <Card className="text-center py-10">
          <MessageSquare className="w-10 h-10 text-ham-purple mx-auto mb-3 opacity-80" />
          <p className="font-semibold text-gray-800 mb-1">No messages yet</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Search for an operator and tap <strong>Send Message</strong> on their profile to start a
            conversation.
          </p>
          <Link
            href="/search"
            className="inline-flex mt-4 text-sm font-medium text-ham-purple hover:underline"
          >
            Search users
          </Link>
        </Card>
      )}

      {!loading && !opening && items.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
          {items.map((item, i) => {
            const callsign = item.peer?.callsign || "Unknown";
            const name = item.peer?.name || callsign;
            const avatar = avatarForCallsign(callsign, item.peer?.avatar);
            const time = item.lastMessageAt
              ? new Date(item.lastMessageAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <Link
                key={item.id}
                href={`/messages/${item.id}`}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                  i < items.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar}
                  alt={callsign}
                  className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {name}{" "}
                      <span className="font-medium text-ham-purple">({callsign})</span>
                    </p>
                    {time && <span className="text-[11px] text-gray-400 shrink-0">{time}</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.lastMessagePreview || "Say hello…"}
                  </p>
                </div>
                {item.unreadCount > 0 && (
                  <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-ham-purple text-white text-[10px] font-bold flex items-center justify-center">
                    {item.unreadCount > 9 ? "9+" : item.unreadCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function MessagesPage() {
  return (
    <AppShell>
      <PageHeader title="Messages" backHref="/" />
      <Suspense fallback={<p className="text-sm text-gray-500 py-8 text-center">Loading messages…</p>}>
        <MessagesInbox />
      </Suspense>
    </AppShell>
  );
}
