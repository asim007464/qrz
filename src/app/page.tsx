"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { NearbyOperators } from "@/components/home/NearbyOperators";
import { DownloadAppCard } from "@/components/home/DownloadAppCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { currentUser, activities as mockActivities, networkUsers } from "@/lib/mock-data";
import { fetchFeedItems } from "@/lib/feed";
import type { ActivityItem } from "@/types";

const PREVIEW_COUNT = 3;

export default function HomePage() {
  const { isLoggedIn, profile, loading } = useAuth();
  const [feedItems, setFeedItems] = useState<ActivityItem[]>(mockActivities);

  useEffect(() => {
    let cancelled = false;
    fetchFeedItems(50)
      .then((items) => {
        if (cancelled || items.length === 0) return;
        setFeedItems(items);
      })
      .catch(() => {
        /* keep mock feed */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const previewItems = feedItems.slice(0, PREVIEW_COUNT);
  const hasMore = feedItems.length > PREVIEW_COUNT;

  const displayUser = profile
    ? {
        ...currentUser,
        callsign: profile.callsign || currentUser.callsign,
        name: profile.name || currentUser.name,
        email: profile.email || currentUser.email,
        avatar: profile.avatar_url || currentUser.avatar,
        location: profile.location || currentUser.location,
        country: profile.country || currentUser.country,
        ituZone: profile.itu_zone || currentUser.ituZone,
        activeBand: profile.active_band || currentUser.activeBand,
        activeFrequency: profile.active_frequency || currentUser.activeFrequency,
        activeMode: profile.active_mode || currentUser.activeMode,
        cqZone: profile.cq_zone || currentUser.cqZone,
        grid: profile.grid || currentUser.grid,
        hrdlogCallsign: profile.hrdlog_callsign || undefined,
      }
    : currentUser;

  return (
    <AppShell>
      {!loading && !isLoggedIn ? (
        <Card className="mb-4 gradient-purple text-white border-0">
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">Welcome to QRZ</p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">Ham Radio Social Network</h2>
          <p className="text-sm text-white/80 mt-2">
            Browse the feed, then sign in or register to send QSL cards, connect with operators, and manage your profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Link href="/login" className="flex-1">
              <Button variant="ghost" className="w-full bg-white !text-black hover:bg-gray-100 hover:!text-black">
                Sign In
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button variant="outline" className="w-full border-white/40 text-white hover:bg-white/10">
                Register Free
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <ProfileBanner user={displayUser} className="mb-4" />
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold tracking-widest uppercase text-gray-600">
              CQ Feed
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href={isLoggedIn ? "/add/post" : "/login?next=/add/post"}
                className="text-xs text-gray-500 hover:text-ham-purple hover:underline"
              >
                Make Post
              </Link>
              <Link href="/feed" className="text-xs text-ham-purple font-medium hover:underline">
                See All
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <ActivityFeed
              key={previewItems.map((a) => a.id).join(",")}
              activities={previewItems}
            />
            <Link
              href="/feed"
              className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 bg-white py-2.5 text-xs font-medium text-ham-purple hover:border-ham-purple/30 hover:bg-ham-purple/5 transition-colors"
            >
              {hasMore ? "Open full CQ Feed" : "See all posts from operators"}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="lg:pl-1">
          <NearbyOperators
            operators={networkUsers.slice(0, 4).filter((u) => u.id !== displayUser.id)}
          />
        </div>
      </div>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="gradient-purple p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">Upcoming Event</p>
          <h3 className="text-xl font-bold mt-1">HAMFEST INDIA 2024</h3>
          <p className="text-sm text-white/70 mt-1">
            Join operators from across the country for workshops, demos, and DX sessions.
          </p>
          <Link href={isLoggedIn ? "/contact" : "/login?next=/contact"}>
            <Button variant="secondary" size="sm" className="mt-3 bg-white/20 hover:bg-white/30 border-0">
              View Details
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="bg-gradient-to-br from-ham-purple to-ham-accent p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
                AI Assistant
                <span className="bg-white/15 rounded-full px-2 py-0.5 text-[10px] font-black">
                  BETA
                </span>
              </p>
              <p className="text-sm text-white/85 mt-2">
                Ask anything about ham radio, DX, propagation, equipment, and more.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <p className="text-xs text-white/70">Beta UI · no real AI backend yet</p>
            <Link href={isLoggedIn ? "/contact" : "/login?next=/contact"} className="sm:flex-1">
              <Button size="md" variant="primary" className="w-full sm:w-auto bg-white text-ham-purple hover:bg-white/90 border-0">
                Ask Now
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <DownloadAppCard className="mt-4" />
    </AppShell>
  );
}
