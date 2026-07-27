"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { AnalyticsData } from "@/types";

const EMPTY_ANALYTICS: AnalyticsData = {
  views: 0,
  clicks: 0,
  shares: 0,
  viewsChange: 0,
  clicksChange: 0,
  sharesChange: 0,
  viewsOverTime: [],
  trafficSources: [],
  recentActivity: [],
};

export default function AnalyticsPage() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const profile = await res.json();
      const views = profile.profile_views ?? 0;
      const searches = profile.profile_searches ?? 0;
      const cards = (profile.cards_received ?? 0) + (profile.cards_sent ?? 0);

      setData({
        views,
        clicks: searches,
        shares: cards,
        viewsChange: 0,
        clicksChange: 0,
        sharesChange: 0,
        viewsOverTime: views > 0 ? [{ day: "Total", views }] : [],
        trafficSources:
          views + searches + cards > 0
            ? [
                { name: "Profile views", value: views, color: "#7C3AED" },
                { name: "Searches", value: searches, color: "#06B6D4" },
                { name: "QSL activity", value: cards, color: "#F59E0B" },
              ].filter((s) => s.value > 0)
            : [],
        recentActivity: [],
      });
      setLoading(false);
    }

    void load();
  }, [authLoading, isLoggedIn]);

  return (
    <AppShell>
      <PageHeader title="Analytics" backHref="/menu" />
      {loading ? (
        <p className="text-center text-gray-500 text-sm py-8">Loading analytics…</p>
      ) : !isLoggedIn ? (
        <p className="text-center text-gray-500 text-sm py-8">Sign in to view your analytics.</p>
      ) : (
        <AnalyticsDashboard data={data} />
      )}
    </AppShell>
  );
}
