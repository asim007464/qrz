import type { UserProfile } from "@/types";

export const EMPTY_PROFILE: UserProfile = {
  id: "",
  callsign: "",
  name: "",
  avatar: "https://i.pravatar.cc/150?u=qrz",
  location: "",
  country: "",
  ituZone: "",
  bio: "",
  stationSetup: "",
  antennaSetup: "",
  qslInfo: "",
  email: "",
  phone: "",
  onAir: false,
  socialLinks: {},
  profileViews: 0,
  profileSearches: 0,
  cardsReceived: 0,
  cardsSent: 0,
  joinedAt: "",
};

export function avatarForCallsign(callsign: string, avatarUrl?: string | null) {
  if (avatarUrl) return avatarUrl;
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(callsign || "qrz")}`;
}
