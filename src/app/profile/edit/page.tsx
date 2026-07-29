"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackgroundPicker } from "@/components/profile/BackgroundPicker";
import { FieldImagePicker } from "@/components/profile/FieldImagePicker";
import { backgroundPresets, MAX_IMAGE_BYTES, MAX_IMAGE_SIZE_LABEL } from "@/lib/constants";
import { avatarForCallsign } from "@/lib/profileDefaults";
import { compressImageFile } from "@/lib/compressImage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const HRDLOG_CALLSIGN_RE = /^[A-Z0-9/-]{3,16}$/i;

export default function EditProfilePage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { isLoggedIn, loading: authLoading, profile } = useAuth();
  const [selectedBg, setSelectedBg] = useState("bg1");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [hrdlogError, setHrdlogError] = useState("");
  const [form, setForm] = useState({
    callsign: "",
    name: "",
    location: "",
    country: "",
    itu_zone: "",
    bio: "",
    station_setup: "",
    antenna_setup: "",
    qsl_info: "",
    bio_image: null as string | null,
    station_setup_image: null as string | null,
    antenna_setup_image: null as string | null,
    qsl_info_image: null as string | null,
    phone: "",
    website: "",
    hrdlog_callsign: "",
  });
  const avatarSrc = avatarUrl || avatarForCallsign(form.callsign || profile?.callsign || "qrz", profile?.avatar_url);

  const normalizedHrdlogCallsign = form.hrdlog_callsign.trim().toUpperCase();

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace("/login?next=/profile/edit");
      return;
    }
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
        bio_image: data.bio_image || null,
        station_setup_image: data.station_setup_image || null,
        antenna_setup_image: data.antenna_setup_image || null,
        qsl_info_image: data.qsl_info_image || null,
        phone: data.phone || "",
        website: links.website || data.website || "",
        hrdlog_callsign: data.hrdlog_callsign || "",
      });
      setAvatarUrl(data.avatar_url || null);
    }
    void load();
  }, [authLoading, isLoggedIn, router]);

  const save = async () => {
    const hrdlogCallsign = normalizedHrdlogCallsign;
    if (hrdlogCallsign && !HRDLOG_CALLSIGN_RE.test(hrdlogCallsign)) {
      setHrdlogError("Enter a valid HRDLOG callsign, e.g. 9K2GV.");
      return;
    }

    setHrdlogError("");
    setSaving(true);
    setSaved(false);
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
      body: JSON.stringify({
        ...form,
        hrdlog_callsign: hrdlogCallsign,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        social_links: { website: form.website },
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Upload a valid image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setAvatarError(`Image must be smaller than ${MAX_IMAGE_SIZE_LABEL}.`);
      return;
    }

    void (async () => {
      setAvatarBusy(true);
      setAvatarError("");
      try {
        const dataUrl = await compressImageFile(file);
        setAvatarUrl(dataUrl);

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
          body: JSON.stringify({ avatar_url: dataUrl }),
        });

        if (!res.ok) {
          throw new Error("Save failed");
        }
      } catch {
        setAvatarError("Could not save photo. Try again.");
      } finally {
        setAvatarBusy(false);
      }
    })();
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <AppShell>
      <PageHeader title="Edit Profile" backHref="/menu" />

      <div className="space-y-4">
        <Card className="flex flex-col items-center">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-ham-purple/20"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarBusy}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-purple flex items-center justify-center disabled:opacity-50"
              aria-label="Change profile photo"
            >
              {avatarBusy ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          {avatarError && <p className="text-xs text-red-500 mt-2">{avatarError}</p>}
        </Card>

        <Card className="space-y-4">
          <Input label="Callsign" value={form.callsign} onChange={set("callsign")} />
          <Input label="Full Name" value={form.name} onChange={set("name")} />
          <Input label="Location" value={form.location} onChange={set("location")} />
          <Input label="Country" value={form.country} onChange={set("country")} />
          <Input label="ITU Zone" value={form.itu_zone} onChange={set("itu_zone")} />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-ham-purple">About & Station</h3>
          <div className="space-y-3">
            <Textarea label="Bio" value={form.bio} onChange={set("bio")} rows={3} />
            <FieldImagePicker
              label="About Me photo"
              imageUrl={form.bio_image}
              onChange={(url) => setForm((f) => ({ ...f, bio_image: url }))}
            />
          </div>
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <Textarea
              label="Station Setup"
              value={form.station_setup}
              onChange={set("station_setup")}
              rows={2}
            />
            <FieldImagePicker
              label="Station Setup photo"
              imageUrl={form.station_setup_image}
              onChange={(url) => setForm((f) => ({ ...f, station_setup_image: url }))}
            />
          </div>
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <Textarea
              label="Antenna Setup"
              value={form.antenna_setup}
              onChange={set("antenna_setup")}
              rows={2}
            />
            <FieldImagePicker
              label="Antenna Setup photo"
              imageUrl={form.antenna_setup_image}
              onChange={(url) => setForm((f) => ({ ...f, antenna_setup_image: url }))}
            />
          </div>
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <Input label="QSL Info" value={form.qsl_info} onChange={set("qsl_info")} />
            <FieldImagePicker
              label="QSL Info photo"
              imageUrl={form.qsl_info_image}
              onChange={(url) => setForm((f) => ({ ...f, qsl_info_image: url }))}
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-semibold text-ham-purple">Contact</h3>
          <Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
          <Input label="Website" value={form.website} onChange={set("website")} />
        </Card>

        <Card className="space-y-3">
          <h3 className="font-semibold text-ham-purple">HRDLOG.net Log</h3>
          <p className="text-xs text-gray-500">
            Enter your HRDLOG.net callsign (for example <span className="font-semibold">9K2GV</span>),
            not the website address. Your last QSOs will appear on the home page.
          </p>
          <Input
            label="HRDLOG Callsign"
            placeholder="e.g. 9K2GV"
            value={form.hrdlog_callsign}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              setForm((f) => ({ ...f, hrdlog_callsign: value }));
              if (!value.trim() || HRDLOG_CALLSIGN_RE.test(value.trim())) {
                setHrdlogError("");
              }
            }}
            className="no-cap"
          />
          {hrdlogError && <p className="text-xs text-red-500">{hrdlogError}</p>}
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
          <Button size="lg" className="flex-1 w-full" onClick={() => void save()} disabled={saving}>
            {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
          </Button>
          <Link href="/menu" className="flex-1">
            <Button size="lg" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
