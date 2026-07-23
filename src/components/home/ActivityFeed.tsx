"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { currentUser } from "@/lib/mock-data";
import type { ActivityItem, ActivityReply } from "@/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ActivityFeedProps = {
  activities: ActivityItem[];
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { isLoggedIn, profile } = useAuth();
  const router = useRouter();
  const [repliesByPost, setRepliesByPost] = useState<Record<string, ActivityReply[]>>(() =>
    Object.fromEntries(activities.map((a) => [a.id, a.replies ?? []]))
  );
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [errorByPost, setErrorByPost] = useState<Record<string, string>>({});

  const replyAs = {
    callsign: profile?.callsign || currentUser.callsign,
    name: profile?.name || currentUser.name,
    avatar: profile?.avatar_url || currentUser.avatar,
  };

  const toggleReply = (postId: string) => {
    if (!isLoggedIn) {
      router.push("/login?next=/");
      return;
    }
    setOpenReplyId((current) => (current === postId ? null : postId));
    setErrorByPost((prev) => ({ ...prev, [postId]: "" }));
  };

  const submitReply = async (postId: string) => {
    const content = (drafts[postId] ?? "").trim();
    if (!content || submittingId) return;

    if (!isLoggedIn) {
      router.push("/login?next=/");
      return;
    }

    setSubmittingId(postId);
    setErrorByPost((prev) => ({ ...prev, [postId]: "" }));

    const optimistic: ActivityReply = {
      id: `local-${Date.now()}`,
      user: replyAs,
      content,
      timestamp: "just now",
    };

    setRepliesByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), optimistic],
    }));
    setDrafts((prev) => ({ ...prev, [postId]: "" }));

    if (UUID_RE.test(postId)) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          router.push("/login?next=/");
          return;
        }

        const res = await fetch(`/api/feed/${postId}/replies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to post reply.");
        }

        const saved = await res.json();
        const confirmed: ActivityReply = {
          id: saved.id,
          content: saved.content,
          timestamp: "just now",
          user: {
            callsign: saved.user?.callsign || replyAs.callsign,
            name: saved.user?.name || replyAs.name,
            avatar: saved.user?.avatar_url || replyAs.avatar,
          },
        };

        setRepliesByPost((prev) => ({
          ...prev,
          [postId]: (prev[postId] ?? []).map((r) => (r.id === optimistic.id ? confirmed : r)),
        }));
      } catch (err) {
        setRepliesByPost((prev) => ({
          ...prev,
          [postId]: (prev[postId] ?? []).filter((r) => r.id !== optimistic.id),
        }));
        setDrafts((prev) => ({ ...prev, [postId]: content }));
        setErrorByPost((prev) => ({
          ...prev,
          [postId]: err instanceof Error ? err.message : "Failed to post reply.",
        }));
      } finally {
        setSubmittingId(null);
      }
      return;
    }

    setSubmittingId(null);
  };

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const replies = repliesByPost[activity.id] ?? [];
        const isOpen = openReplyId === activity.id;

        return (
          <div
            key={activity.id}
            className="bg-white rounded-2xl p-4 card-shadow border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <Link href={`/profile/${activity.user.callsign}`}>
                <Image
                  src={activity.user.avatar}
                  alt={activity.user.callsign}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${activity.user.callsign}`}
                    className="font-semibold text-ham-purple hover:underline"
                  >
                    {activity.user.callsign}
                  </Link>
                  <span className="text-xs text-gray-400">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{activity.content}</p>
                {activity.image && (
                  <div className="mt-3 rounded-xl overflow-hidden">
                    {activity.image.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activity.image}
                        alt="Post"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <Image
                        src={activity.image}
                        alt="Post"
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleReply(activity.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-ham-purple transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Reply
                    {replies.length > 0 && (
                      <span className="text-gray-400">· {replies.length}</span>
                    )}
                  </button>
                </div>

                {replies.length > 0 && (
                  <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5">
                        <Link href={`/profile/${reply.user.callsign}`}>
                          <Image
                            src={reply.user.avatar}
                            alt={reply.user.callsign}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0 rounded-xl bg-gray-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${reply.user.callsign}`}
                              className="text-xs font-semibold text-ham-purple hover:underline"
                            >
                              {reply.user.callsign}
                            </Link>
                            <span className="text-[10px] text-gray-400">{reply.timestamp}</span>
                          </div>
                          <p className="text-xs text-gray-700 mt-0.5">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isOpen && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      rows={2}
                      placeholder="Write a reply…"
                      value={drafts[activity.id] ?? ""}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [activity.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void submitReply(activity.id);
                        }
                      }}
                    />
                    {errorByPost[activity.id] && (
                      <p className="text-xs text-red-500">{errorByPost[activity.id]}</p>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenReplyId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!(drafts[activity.id] ?? "").trim() || submittingId === activity.id}
                        onClick={() => void submitReply(activity.id)}
                        className="gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {submittingId === activity.id ? "Sending…" : "Reply"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
