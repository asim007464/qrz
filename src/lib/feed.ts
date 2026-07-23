import { relativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";

export type FeedApiPost = {
  id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  user?: {
    name?: string | null;
    callsign?: string | null;
    avatar_url?: string | null;
  } | null;
};

export function mapFeedPost(post: FeedApiPost): ActivityItem {
  const callsign = post.user?.callsign || "UNKNOWN";
  return {
    id: post.id,
    content: post.content,
    image: post.image_url || undefined,
    timestamp: relativeTime(post.created_at),
    user: {
      callsign,
      name: post.user?.name || callsign,
      avatar:
        post.user?.avatar_url ||
        `https://i.pravatar.cc/150?u=${encodeURIComponent(callsign)}`,
    },
    replies: [],
  };
}

export async function fetchFeedItems(limit = 50): Promise<ActivityItem[]> {
  const res = await fetch(`/api/feed?limit=${limit}`);
  if (!res.ok) return [];
  const data: FeedApiPost[] = await res.json();
  if (!Array.isArray(data) || data.length === 0) return [];
  return data.map(mapFeedPost);
}
