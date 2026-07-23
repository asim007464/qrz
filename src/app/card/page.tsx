"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Share2, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { SocialLinkButtons } from "@/components/profile/SocialLinks";
import { ProfileFieldCard } from "@/components/profile/ProfileFieldCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { currentUser } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type FieldImages = {
  bio_image: string | null;
  station_setup_image: string | null;
  antenna_setup_image: string | null;
  qsl_info_image: string | null;
};

const EMPTY_IMAGES: FieldImages = {
  bio_image: null,
  station_setup_image: null,
  antenna_setup_image: null,
  qsl_info_image: null,
};

export default function DigitalCardPage() {
  const { isLoggedIn, profile, loading } = useAuth();
  const [images, setImages] = useState<FieldImages>(EMPTY_IMAGES);
  const [sectionText, setSectionText] = useState({
    bio: currentUser.bio,
    stationSetup: currentUser.stationSetup,
    antennaSetup: currentUser.antennaSetup,
    qslInfo: currentUser.qslInfo,
  });

  const user = profile
    ? {
        ...currentUser,
        callsign: profile.callsign || currentUser.callsign,
        name: profile.name || currentUser.name,
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
        bio: sectionText.bio,
        stationSetup: sectionText.stationSetup,
        antennaSetup: sectionText.antennaSetup,
        qslInfo: sectionText.qslInfo,
      }
    : {
        ...currentUser,
        bio: sectionText.bio,
        stationSetup: sectionText.stationSetup,
        antennaSetup: sectionText.antennaSetup,
        qslInfo: sectionText.qslInfo,
      };

  useEffect(() => {
    if (loading || !isLoggedIn) return;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setSectionText({
        bio: data.bio || currentUser.bio,
        stationSetup: data.station_setup || currentUser.stationSetup,
        antennaSetup: data.antenna_setup || currentUser.antennaSetup,
        qslInfo: data.qsl_info || currentUser.qslInfo,
      });
      setImages({
        bio_image: data.bio_image || null,
        station_setup_image: data.station_setup_image || null,
        antenna_setup_image: data.antenna_setup_image || null,
        qsl_info_image: data.qsl_info_image || null,
      });
    }

    void load();
  }, [isLoggedIn, loading]);

  const saveImage = useCallback(
    async (field: keyof FieldImages, dataUrl: string | null) => {
      const previous = images[field];
      setImages((prev) => ({ ...prev, [field]: dataUrl }));

      if (!isLoggedIn) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: dataUrl }),
      });

      if (!res.ok) {
        setImages((prev) => ({ ...prev, [field]: previous }));
        throw new Error("Failed to save photo.");
      }
    },
    [images, isLoggedIn]
  );

  const shareCard = async () => {
    const url = `${window.location.origin}/profile/${user.callsign}`;
    if (navigator.share) {
      await navigator.share({ title: `${user.callsign} on QRZ`, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Profile link copied to clipboard!");
    }
  };

  return (
    <AppShell>
      <PageHeader title="My Digital Card" backHref="/menu" />
      <ProfileBanner user={user} className="mb-4" />

      <div className="space-y-3 mb-6">
        <ProfileFieldCard
          title="About Me"
          content={user.bio}
          imageUrl={images.bio_image}
          editable
          onImageChange={(url) => saveImage("bio_image", url)}
        />
        <ProfileFieldCard
          title="Station Setup"
          content={user.stationSetup}
          imageUrl={images.station_setup_image}
          editable
          onImageChange={(url) => saveImage("station_setup_image", url)}
        />
        <ProfileFieldCard
          title="Antenna Setup"
          content={user.antennaSetup}
          imageUrl={images.antenna_setup_image}
          editable
          onImageChange={(url) => saveImage("antenna_setup_image", url)}
        />
        <ProfileFieldCard
          title="QSL Info"
          content={user.qslInfo}
          imageUrl={images.qsl_info_image}
          editable
          onImageChange={(url) => saveImage("qsl_info_image", url)}
        />

        <Card>
          <h3 className="font-semibold text-ham-purple mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium text-gray-800">Phone:</span> {user.phone}
            </p>
            <p>
              <span className="font-medium text-gray-800">Location:</span> {user.location}
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-ham-purple mb-3">Social Links</h3>
          <SocialLinkButtons links={user.socialLinks} />
        </Card>

        <Card>
          <h3 className="font-semibold text-ham-purple mb-2">QSL Statistics</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-2xl font-bold text-ham-purple">{user.cardsReceived}</p>
              <p className="text-xs text-gray-500">Cards Received</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-2xl font-bold text-ham-purple">{user.cardsSent}</p>
              <p className="text-xs text-gray-500">Cards Sent</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="flex items-center justify-center gap-2" onClick={shareCard}>
          <Share2 className="w-4 h-4" />
          Share My Card
        </Button>
        <Link href={`/profile/${user.callsign}`} className="flex-1">
          <Button size="lg" variant="outline" className="w-full flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Preview Card
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
