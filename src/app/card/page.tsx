"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Share2, Eye, Pencil, Check, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { SocialLinkButtons } from "@/components/profile/SocialLinks";
import { ProfileFieldCard } from "@/components/profile/ProfileFieldCard";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { avatarForCallsign, EMPTY_PROFILE } from "@/lib/profileDefaults";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { SocialLinks, UserProfile } from "@/types";

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

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "website", label: "Website", placeholder: "https://yoursite.com" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/..." },
];

export default function DigitalCardPage() {
  const { isLoggedIn, profile, loading } = useAuth();
  const [images, setImages] = useState<FieldImages>(EMPTY_IMAGES);
  const [user, setUser] = useState<UserProfile>(EMPTY_PROFILE);
  const [editingContact, setEditingContact] = useState(false);
  const [editingSocial, setEditingSocial] = useState(false);
  const [contactDraft, setContactDraft] = useState({ phone: "", location: "", country: "" });
  const [socialDraft, setSocialDraft] = useState<SocialLinks>({});
  const [savingSection, setSavingSection] = useState<string | null>(null);

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
      const links = (data.social_links || {}) as SocialLinks;
      setUser({
        ...EMPTY_PROFILE,
        id: data.id,
        callsign: data.callsign || "",
        name: data.name || data.callsign || "",
        email: data.email || "",
        avatar: avatarForCallsign(data.callsign, data.avatar_url),
        location: data.location || "",
        country: data.country || "",
        ituZone: data.itu_zone || "",
        bio: data.bio || "",
        stationSetup: data.station_setup || "",
        antennaSetup: data.antenna_setup || "",
        qslInfo: data.qsl_info || "",
        phone: data.phone || "",
        onAir: Boolean(data.on_air),
        socialLinks: links,
        activeBand: data.active_band || undefined,
        activeFrequency: data.active_frequency || undefined,
        activeMode: data.active_mode || undefined,
        cqZone: data.cq_zone || undefined,
        grid: data.grid || undefined,
        hrdlogCallsign: data.hrdlog_callsign || undefined,
        profileViews: data.profile_views ?? 0,
        profileSearches: data.profile_searches ?? 0,
        cardsReceived: data.cards_received ?? 0,
        cardsSent: data.cards_sent ?? 0,
        joinedAt: data.created_at || "",
      });
      setContactDraft({
        phone: data.phone || "",
        location: data.location || "",
        country: data.country || "",
      });
      setSocialDraft(links);
      setImages({
        bio_image: data.bio_image || null,
        station_setup_image: data.station_setup_image || null,
        antenna_setup_image: data.antenna_setup_image || null,
        qsl_info_image: data.qsl_info_image || null,
      });
    }

    void load();
  }, [isLoggedIn, loading]);

  const patchProfile = useCallback(
    async (payload: Record<string, unknown>) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not signed in");

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    []
  );

  const saveImage = useCallback(
    async (field: keyof FieldImages, dataUrl: string | null) => {
      const previous = images[field];
      setImages((prev) => ({ ...prev, [field]: dataUrl }));
      try {
        await patchProfile({ [field]: dataUrl });
      } catch {
        setImages((prev) => ({ ...prev, [field]: previous }));
        throw new Error("Failed to save photo.");
      }
    },
    [images, patchProfile]
  );

  const saveTextField = useCallback(
    async (apiKey: string, userKey: keyof UserProfile, value: string) => {
      const previous = String(user[userKey] ?? "");
      setUser((prev) => ({ ...prev, [userKey]: value }));
      setSavingSection(apiKey);
      try {
        await patchProfile({ [apiKey]: value });
      } catch {
        setUser((prev) => ({ ...prev, [userKey]: previous }));
        throw new Error("Failed to save.");
      } finally {
        setSavingSection(null);
      }
    },
    [patchProfile, user]
  );

  const saveContact = async () => {
    setSavingSection("contact");
    try {
      await patchProfile({
        phone: contactDraft.phone,
        location: contactDraft.location,
        country: contactDraft.country,
      });
      setUser((prev) => ({
        ...prev,
        phone: contactDraft.phone,
        location: contactDraft.location,
        country: contactDraft.country,
      }));
      setEditingContact(false);
    } catch {
      alert("Could not save contact info.");
    } finally {
      setSavingSection(null);
    }
  };

  const saveSocial = async () => {
    setSavingSection("social");
    try {
      const cleaned = Object.fromEntries(
        Object.entries(socialDraft).map(([k, v]) => [k, String(v || "").trim()])
      ) as SocialLinks;
      await patchProfile({ social_links: cleaned });
      setUser((prev) => ({ ...prev, socialLinks: cleaned }));
      setSocialDraft(cleaned);
      setEditingSocial(false);
    } catch {
      alert("Could not save social links.");
    } finally {
      setSavingSection(null);
    }
  };

  const shareCard = async () => {
    if (!user.callsign) return;
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
      {user.callsign ? (
        <ProfileBanner user={user} className="mb-4" />
      ) : (
        <Card className="mb-4 p-6 text-sm text-gray-500">Sign in to view your digital card.</Card>
      )}

      <div className="space-y-3 mb-6">
        <ProfileFieldCard
          title="About Me"
          content={user.bio}
          imageUrl={images.bio_image}
          editable
          onImageChange={(url) => saveImage("bio_image", url)}
          onContentChange={(value) => saveTextField("bio", "bio", value)}
          contentPlaceholder="Tell others about yourself…"
        />
        <ProfileFieldCard
          title="Station Setup"
          content={user.stationSetup}
          imageUrl={images.station_setup_image}
          editable
          onImageChange={(url) => saveImage("station_setup_image", url)}
          onContentChange={(value) => saveTextField("station_setup", "stationSetup", value)}
          contentPlaceholder="Describe your radio station…"
        />
        <ProfileFieldCard
          title="Antenna Setup"
          content={user.antennaSetup}
          imageUrl={images.antenna_setup_image}
          editable
          onImageChange={(url) => saveImage("antenna_setup_image", url)}
          onContentChange={(value) => saveTextField("antenna_setup", "antennaSetup", value)}
          contentPlaceholder="Describe your antenna setup…"
        />
        <ProfileFieldCard
          title="QSL Info"
          content={user.qslInfo}
          imageUrl={images.qsl_info_image}
          editable
          onImageChange={(url) => saveImage("qsl_info_image", url)}
          onContentChange={(value) => saveTextField("qsl_info", "qslInfo", value)}
          contentPlaceholder="QSL via LoTW, eQSL, direct mail…"
        />

        <Card>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-ham-purple">Contact Information</h3>
            {!editingContact ? (
              <button
                type="button"
                onClick={() => {
                  setContactDraft({
                    phone: user.phone,
                    location: user.location,
                    country: user.country,
                  });
                  setEditingContact(true);
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ham-purple hover:bg-ham-purple/10"
                aria-label="Edit contact information"
              >
                <Pencil className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {editingContact ? (
            <div className="space-y-3">
              <Input label="Phone" type="tel" value={contactDraft.phone} onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))} />
              <Input label="Location" value={contactDraft.location} onChange={(e) => setContactDraft((d) => ({ ...d, location: e.target.value }))} />
              <Input label="Country" value={contactDraft.country} onChange={(e) => setContactDraft((d) => ({ ...d, country: e.target.value }))} />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void saveContact()}
                  disabled={savingSection === "contact"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ham-purple px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingContact(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-800">Email:</span> {user.email || "—"}
              </p>
              <p>
                <span className="font-medium text-gray-800">Phone:</span> {user.phone || "—"}
              </p>
              <p>
                <span className="font-medium text-gray-800">Location:</span>{" "}
                {[user.location, user.country].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold text-ham-purple">Social Links</h3>
            {!editingSocial ? (
              <button
                type="button"
                onClick={() => {
                  setSocialDraft(user.socialLinks);
                  setEditingSocial(true);
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-ham-purple hover:bg-ham-purple/10"
                aria-label="Edit social links"
              >
                <Pencil className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {editingSocial ? (
            <div className="space-y-3">
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <Input
                  key={key}
                  label={label}
                  value={socialDraft[key] || ""}
                  onChange={(e) => setSocialDraft((d) => ({ ...d, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="no-cap"
                />
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void saveSocial()}
                  disabled={savingSection === "social"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ham-purple px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSocial(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <SocialLinkButtons links={user.socialLinks} />
          )}
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
        <Button size="lg" className="flex items-center justify-center gap-2" onClick={shareCard} disabled={!user.callsign}>
          <Share2 className="w-4 h-4" />
          Share My Card
        </Button>
        {user.callsign && (
          <Link href={`/profile/${user.callsign}`} className="flex-1">
            <Button size="lg" variant="outline" className="w-full flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Card
            </Button>
          </Link>
        )}
      </div>
    </AppShell>
  );
}
