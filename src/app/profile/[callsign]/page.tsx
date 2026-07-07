import { notFound } from "next/navigation";
import Link from "next/link";
import { Send, UserPlus, Eye, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { SocialLinkButtons } from "@/components/profile/SocialLinks";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getUserByCallsign } from "@/lib/mock-data";

type Props = {
  params: Promise<{ callsign: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { callsign } = await params;
  const user = getUserByCallsign(callsign);

  if (!user) notFound();

  const isOwnProfile = user.callsign === "K2ABC";

  return (
    <AppShell>
      <PageHeader title={user.callsign} backHref="/search" />

      <ProfileBanner user={user} className="mb-4" />

      {!isOwnProfile && (
        <div className="flex gap-2 mb-4">
          <Button className="flex-1 flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            Connect
          </Button>
          <Link href="/qsl/send" className="flex-1">
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
        <Card>
          <h3 className="font-semibold text-ham-purple mb-2">About Me</h3>
          <p className="text-sm text-gray-600">{user.bio}</p>
        </Card>

        <Card>
          <h3 className="font-semibold text-ham-purple mb-2">Station Setup</h3>
          <p className="text-sm text-gray-600">{user.stationSetup}</p>
        </Card>

        <Card>
          <h3 className="font-semibold text-ham-purple mb-2">Antenna Setup</h3>
          <p className="text-sm text-gray-600">{user.antennaSetup}</p>
        </Card>

        <Card>
          <h3 className="font-semibold text-ham-purple mb-2">QSL Info</h3>
          <p className="text-sm text-gray-600">{user.qslInfo}</p>
        </Card>

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
          <SocialLinkButtons size="sm" />
        </Card>
      </div>
    </AppShell>
  );
}
