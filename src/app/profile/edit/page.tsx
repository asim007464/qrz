"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera } from "lucide-react";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackgroundPicker } from "@/components/profile/BackgroundPicker";
import { currentUser, backgroundPresets } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function EditProfilePage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [selectedBg, setSelectedBg] = useState("bg1");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    callsign: currentUser.callsign,
    name: currentUser.name,
    location: currentUser.location,
    country: currentUser.country,
    itu_zone: currentUser.ituZone,
    bio: currentUser.bio,
    station_setup: currentUser.stationSetup,
    antenna_setup: currentUser.antennaSetup,
    qsl_info: currentUser.qslInfo,
    phone: currentUser.phone,
    website: currentUser.socialLinks.website || "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace("/login?next=/profile/edit");
      return;
    }
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const links = (data.social_links || {}) as Record<string, string>;
      setForm({
        callsign: data.callsign || "",
        name: data.name || "",
        location: data.location || "",
        country: data.country || "",
        itu_zone: data.itu_zone || "",
        bio: data.bio || "",
        station_setup: data.station_setup || "",
        antenna_setup: data.antenna_setup || "",
        qsl_info: data.qsl_info || "",
        phone: data.phone || "",
        website: links.website || data.website || "",
      });
    }
    load();
  }, [authLoading, isLoggedIn, router]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        social_links: { website: form.website },
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <AppShell>
      <PageHeader title="Edit Profile" backHref="/menu" />

      <div className="space-y-4">
        <Card className="flex flex-col items-center">
          <div className="relative">
            <Image
              src={currentUser.avatar}
              alt="Avatar"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-ham-purple/20"
            />
            <button type="button" className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-purple flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Avatar upload coming soon</p>
        </Card>

        <Card className="space-y-4">
          <Input label="Callsign" value={form.callsign} onChange={set("callsign")} />
          <Input label="Full Name" value={form.name} onChange={set("name")} />
          <Input label="Location" value={form.location} onChange={set("location")} />
          <Input label="Country" value={form.country} onChange={set("country")} />
          <Input label="ITU Zone" value={form.itu_zone} onChange={set("itu_zone")} />
          <Textarea label="Bio" value={form.bio} onChange={set("bio")} rows={3} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-ham-purple">Station & Antenna</h3>
          <Textarea label="Station Setup" value={form.station_setup} onChange={set("station_setup")} rows={2} />
          <Textarea label="Antenna Setup" value={form.antenna_setup} onChange={set("antenna_setup")} rows={2} />
          <Input label="QSL Info" value={form.qsl_info} onChange={set("qsl_info")} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-ham-purple">Contact</h3>
          <Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
          <Input label="Website" value={form.website} onChange={set("website")} />
        </Card>

        <Card>
          <BackgroundPicker
            presets={backgroundPresets}
            selectedId={selectedBg}
            onSelect={(p) => setSelectedBg(p.id)}
            label="Profile Banner Background"
          />
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <Button size="lg" className="flex-1 w-full" onClick={save} disabled={saving}>
            {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
          </Button>
          <Link href="/menu" className="flex-1">
            <Button size="lg" variant="outline" className="w-full">Cancel</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
