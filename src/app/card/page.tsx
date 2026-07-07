"use client";

import Link from "next/link";
import { Share2, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { SocialLinkButtons } from "@/components/profile/SocialLinks";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { currentUser } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";

function InfoSection({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <h3 className="font-semibold text-ham-purple mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </Card>
  );
}

export default function DigitalCardPage() {
  const { profile } = useAuth();
  const user = profile
    ? { ...currentUser, callsign: profile.callsign || currentUser.callsign, name: profile.name || currentUser.name }
    : currentUser;

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
        <InfoSection title="About Me" content={user.bio} />
        <InfoSection title="Station Setup" content={user.stationSetup} />
        <InfoSection title="Antenna Setup" content={user.antennaSetup} />
        <InfoSection title="QSL Info" content={user.qslInfo} />

        <Card>
          <h3 className="font-semibold text-ham-purple mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-800">Email:</span> {user.email}</p>
            <p><span className="font-medium text-gray-800">Phone:</span> {user.phone}</p>
            <p><span className="font-medium text-gray-800">Location:</span> {user.location}</p>
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
