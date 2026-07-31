import { notFound } from "next/navigation";
import Link from "next/link";
import { Send, Eye, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { SocialLinkButtons } from "@/components/profile/SocialLinks";
import { ProfileFieldCard } from "@/components/profile/ProfileFieldCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConnectButton } from "@/components/network/ConnectButton";
import { MessageButton } from "@/components/messages/MessageButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types";

type Props = {
  params: Promise<{ callsign: string }>;
};

type ProfileRow = {
  id: string;
  name: string | null;
  callsign: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  country: string | null;
  itu_zone: string | null;
  active_band: string | null;
  active_frequency: string | null;
  active_mode: string | null;
  cq_zone: string | null;
  grid: string | null;
  station_setup: string | null;
  antenna_setup: string | null;
  qsl_info: string | null;
  bio_image: string | null;
  station_setup_image: string | null;
  antenna_setup_image: string | null;
  qsl_info_image: string | null;
  phone: string | null;
  website: string | null;
  hrdlog_callsign: string | null;
  on_air: boolean | null;
  background_image: string | null;
  social_links: Record<string, string> | null;
  profile_views: number | null;
  profile_searches: number | null;
  cards_received: number | null;
  cards_sent: number | null;
  created_at: string | null;
};

async function getSupabaseProfile(callsign: string): Promise<UserProfile | null> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select(
        "id, name, callsign, email, bio, avatar_url, location, country, itu_zone, active_band, active_frequency, active_mode, cq_zone, grid, station_setup, antenna_setup, qsl_info, bio_image, station_setup_image, antenna_setup_image, qsl_info_image, phone, website, hrdlog_callsign, on_air, background_image, social_links, profile_views, profile_searches, cards_received, cards_sent, created_at"
      )
      .ilike("callsign", callsign)
      .maybeSingle<ProfileRow>();

    if (!data || !data.callsign) return null;

    return {
      id: data.id,
      callsign: data.callsign,
      name: data.name || data.callsign,
      avatar: data.avatar_url || "https://i.pravatar.cc/150?u=" + encodeURIComponent(data.callsign),
      location: data.location || "",
      country: data.country || "",
      ituZone: data.itu_zone || "",
      bio: data.bio || "QRZ operator profile.",
      stationSetup: data.station_setup || "",
      antennaSetup: data.antenna_setup || "",
      qslInfo: data.qsl_info || "",
      bioImage: data.bio_image || undefined,
      stationSetupImage: data.station_setup_image || undefined,
      antennaSetupImage: data.antenna_setup_image || undefined,
      qslInfoImage: data.qsl_info_image || undefined,
      email: data.email || "",
      phone: data.phone || "",
      onAir: Boolean(data.on_air),
      socialLinks: data.social_links || (data.website ? { website: data.website } : {}),
      backgroundImage: data.background_image || undefined,
      activeBand: data.active_band || undefined,
      activeFrequency: data.active_frequency || undefined,
      activeMode: data.active_mode || undefined,
      cqZone: data.cq_zone || undefined,
      grid: data.grid || undefined,
      hrdlogCallsign: data.hrdlog_callsign || undefined,
      profileViews: data.profile_views || 0,
      profileSearches: data.profile_searches || 0,
      cardsReceived: data.cards_received || 0,
      cardsSent: data.cards_sent || 0,
      joinedAt: data.created_at || "",
    };
  } catch (err) {
    console.error("Profile lookup error:", err);
    return null;
  }
}

export default async function ProfilePage({ params }: Props) {
  const { callsign } = await params;
  const user = await getSupabaseProfile(callsign);

  if (!user) notFound();

  let isOwnProfile = false;
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    isOwnProfile = Boolean(authUser?.id && authUser.id === user.id);
  } catch {
    isOwnProfile = false;
  }

  return (
    <AppShell>
      <PageHeader title={user.callsign} backHref="/search" />

      <ProfileBanner user={user} className="mb-4" />

      {!isOwnProfile && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <ConnectButton callsign={user.callsign} className="sm:flex-1" />
          <MessageButton callsign={user.callsign} />
          <Link href={`/qsl/send?to=${encodeURIComponent(user.callsign)}`} className="sm:flex-1">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Send QSL
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Card className="text-center py-3">
          <div className="flex items-center justify-center gap-1 text-ham-purple">
            <Eye className="w-4 h-4" />
            <span className="text-xl font-bold">{user.profileViews}</span>
          </div>
          <p className="text-xs text-gray-500">Profile Views</p>
        </Card>
        <Card className="text-center py-3">
          <div className="flex items-center justify-center gap-1 text-ham-purple">
            <Search className="w-4 h-4" />
            <span className="text-xl font-bold">{user.profileSearches}</span>
          </div>
          <p className="text-xs text-gray-500">Profile Searches</p>
        </Card>
      </div>

      <div className="space-y-3">
        <ProfileFieldCard title="About Me" content={user.bio} imageUrl={user.bioImage} />
        <ProfileFieldCard
          title="Station Setup"
          content={user.stationSetup}
          imageUrl={user.stationSetupImage}
        />
        <ProfileFieldCard
          title="Antenna Setup"
          content={user.antennaSetup}
          imageUrl={user.antennaSetupImage}
        />
        <ProfileFieldCard title="QSL Info" content={user.qslInfo} imageUrl={user.qslInfoImage} />

        {!isOwnProfile && (
          <Card>
            <h3 className="font-semibold text-ham-purple mb-2">Contact</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {user.email && <p>Email: {user.email}</p>}
              {user.phone && <p>Phone: {user.phone}</p>}
            </div>
          </Card>
        )}

        <Card>
          <h3 className="font-semibold text-ham-purple mb-3">QSL Cards</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-2xl font-bold text-ham-purple">{user.cardsReceived}</p>
              <p className="text-xs text-gray-500">Received</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-2xl font-bold text-ham-purple">{user.cardsSent}</p>
              <p className="text-xs text-gray-500">Sent</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-ham-purple mb-3">Social Links</h3>
          <SocialLinkButtons size="sm" links={user.socialLinks} />
        </Card>
      </div>
    </AppShell>
  );
}
