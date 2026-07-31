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
import { useSiteCopy } from "@/hooks/useSiteCopy";
import { fetchFeedItems } from "@/lib/feed";
import { avatarForCallsign, EMPTY_PROFILE } from "@/lib/profileDefaults";
import type { ActivityItem, UserProfile } from "@/types";

const PREVIEW_COUNT = 3;

function profileFromAuth(
  profile: NonNullable<ReturnType<typeof useAuth>["profile"]>,
  userId?: string
): UserProfile {
  return {
    ...EMPTY_PROFILE,
    id: userId || "",
    callsign: profile.callsign || "",
    name: profile.name || profile.callsign || "",
    email: profile.email || "",
    avatar: avatarForCallsign(profile.callsign, profile.avatar_url),
    location: profile.location || "",
    country: profile.country || "",
    ituZone: profile.itu_zone || "",
    activeBand: profile.active_band || undefined,
    activeFrequency: profile.active_frequency || undefined,
    activeMode: profile.active_mode || undefined,
    cqZone: profile.cq_zone || undefined,
    grid: profile.grid || undefined,
    hrdlogCallsign: profile.hrdlog_callsign || undefined,
  };
}

export default function HomePage() {
  const { isLoggedIn, profile, user, loading } = useAuth();
  const { t } = useSiteCopy();
  const [feedItems, setFeedItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchFeedItems(50)
      .then((items) => {
        if (!cancelled) setFeedItems(items);
      })
      .catch(() => {
        if (!cancelled) setFeedItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const previewItems = feedItems.slice(0, PREVIEW_COUNT);
  const hasMore = feedItems.length > PREVIEW_COUNT;

  const displayUser = profile
    ? profileFromAuth(profile, user?.id)
    : EMPTY_PROFILE;

  return (
    <AppShell>
      {!loading && !isLoggedIn ? (
        <Card className="mb-4 gradient-purple text-white border-0">
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">
            {t("home.welcome_eyebrow")}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">{t("home.welcome_title")}</h2>
          <p className="text-sm text-white/80 mt-2">{t("home.welcome_body")}</p>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Link href="/login" className="flex-1">
              <Button variant="ghost" className="w-full bg-white !text-black hover:bg-gray-100 hover:!text-black">
                {t("home.sign_in_cta")}
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button variant="outline" className="w-full border-white/40 text-white hover:bg-white/10">
                {t("home.register_cta")}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        profile && <ProfileBanner user={displayUser} className="mb-4" />
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide uppercase text-gray-800">
              {t("home.feed_heading")}
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href={isLoggedIn ? "/add/post" : "/login?next=/add/post"}
                className="text-xs text-gray-500 hover:text-ham-purple hover:underline"
              >
                {t("home.make_post_link")}
              </Link>
              <Link href="/feed" className="text-xs text-ham-purple font-medium hover:underline">
                {t("home.see_all_link")}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {previewItems.length > 0 ? (
              <ActivityFeed
                key={previewItems.map((a) => a.id).join(",")}
                activities={previewItems}
              />
            ) : (
              <Card className="text-center py-8 text-sm text-gray-500">
                {t("home.empty_feed")}{" "}
                <Link href={isLoggedIn ? "/add/post" : "/register"} className="text-ham-purple underline">
                  {t("home.be_first_link")}
                </Link>
              </Card>
            )}
            <Link
              href="/feed"
              className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 bg-white py-2.5 text-xs font-medium text-ham-purple hover:border-ham-purple/30 hover:bg-ham-purple/5 transition-colors"
            >
              {hasMore ? t("home.open_full_feed") : t("home.see_all_posts")}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="lg:pl-1">
          <NearbyOperators
            excludeId={user?.id}
            userLat={profile?.latitude}
            userLng={profile?.longitude}
          />
        </div>
      </div>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="gradient-purple p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">
            {t("home.event_eyebrow")}
          </p>
          <h3 className="text-xl font-bold mt-1">{t("home.event_title")}</h3>
          <p className="text-sm text-white/70 mt-1">{t("home.event_body")}</p>
          <Link href={isLoggedIn ? "/contact" : "/login?next=/contact"}>
            <Button variant="secondary" size="sm" className="mt-3 bg-white/20 hover:bg-white/30 border-0">
              {t("home.event_cta")}
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden p-0">
        <div className="bg-gradient-to-br from-ham-purple to-ham-accent p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
                {t("home.ai_eyebrow")}
                <span className="bg-white/15 rounded-full px-2 py-0.5 text-[10px] font-black">
                  BETA
                </span>
              </p>
              <p className="text-sm text-white/85 mt-2">{t("home.ai_body")}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <p className="text-xs text-white/70">{t("home.ai_hint")}</p>
            <Link href={isLoggedIn ? "/contact" : "/login?next=/contact"} className="sm:flex-1">
              <Button size="md" variant="primary" className="w-full sm:w-auto bg-white text-ham-purple hover:bg-white/90 border-0">
                {t("home.ai_cta")}
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <DownloadAppCard className="mt-4" />
    </AppShell>
  );
}
