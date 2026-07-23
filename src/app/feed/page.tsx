"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenSquare } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { activities as mockActivities } from "@/lib/mock-data";
import { fetchFeedItems } from "@/lib/feed";
import type { ActivityItem } from "@/types";

export default function CQFeedPage() {
  const { isLoggedIn } = useAuth();
  const [feedItems, setFeedItems] = useState<ActivityItem[]>(mockActivities);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeedItems(100)
      .then((items) => {
        if (cancelled) return;
        if (items.length > 0) setFeedItems(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <PageHeader title="CQ Feed" backHref="/" />

      <Card className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ham-purple">Posts from operators worldwide</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Read the latest CQ calls, DX reports, and field updates — then add your own.
          </p>
        </div>
        <Link href={isLoggedIn ? "/add/post" : "/login?next=/add/post"} className="shrink-0">
          <Button size="sm" className="w-full sm:w-auto inline-flex items-center gap-1.5">
            <PenSquare className="w-3.5 h-3.5" />
            Make Post
          </Button>
        </Link>
      </Card>

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Loading feed…</p>
      ) : feedItems.length === 0 ? (
        <Card className="text-center py-10 space-y-3">
          <p className="text-sm text-gray-600">No posts yet. Be the first on the CQ Feed.</p>
          <Link href={isLoggedIn ? "/add/post" : "/login?next=/add/post"}>
            <Button size="sm" className="inline-flex items-center gap-1.5">
              <PenSquare className="w-3.5 h-3.5" />
              Make Post
            </Button>
          </Link>
        </Card>
      ) : (
        <ActivityFeed key={feedItems.map((a) => a.id).join(",")} activities={feedItems} />
      )}
    </AppShell>
  );
}
