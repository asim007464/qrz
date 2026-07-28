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
import { useSiteCopy } from "@/hooks/useSiteCopy";
import { fetchFeedItems } from "@/lib/feed";
import type { ActivityItem } from "@/types";

export default function CQFeedPage() {
  const { isLoggedIn } = useAuth();
  const { t } = useSiteCopy();
  const [feedItems, setFeedItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeedItems(100)
      .then((items) => {
        if (cancelled) return;
        setFeedItems(items);
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
      <PageHeader title={t("feed.title")} backHref="/" />

      <Card className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ham-purple">{t("feed.subtitle")}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t("feed.description")}</p>
        </div>
        <Link href={isLoggedIn ? "/add/post" : "/login?next=/add/post"} className="shrink-0">
          <Button size="sm" className="w-full sm:w-auto inline-flex items-center gap-1.5">
            <PenSquare className="w-3.5 h-3.5" />
            {t("feed.make_post_cta")}
          </Button>
        </Link>
      </Card>

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Loading feed…</p>
      ) : feedItems.length === 0 ? (
        <Card className="text-center py-10 space-y-3">
          <p className="text-sm text-gray-600">{t("feed.empty")}</p>
          <Link href={isLoggedIn ? "/add/post" : "/login?next=/add/post"}>
            <Button size="sm" className="inline-flex items-center gap-1.5">
              <PenSquare className="w-3.5 h-3.5" />
              {t("feed.make_post_cta")}
            </Button>
          </Link>
        </Card>
      ) : (
        <ActivityFeed key={feedItems.map((a) => a.id).join(",")} activities={feedItems} />
      )}
    </AppShell>
  );
}
