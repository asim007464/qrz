export type SocialLinks = {
  website?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
};

export type UserProfile = {
  id: string;
  callsign: string;
  name: string;
  avatar: string;
  location: string;
  country: string;
  ituZone: string;
  bio: string;
  stationSetup: string;
  antennaSetup: string;
  qslInfo: string;
  email: string;
  phone: string;
  onAir: boolean;
  socialLinks: SocialLinks;
  backgroundImage?: string;
  // Optional "Now operating" stats shown in the mobile app UI
  activeBand?: string; // e.g. "20m"
  activeFrequency?: string; // e.g. "14.240 MHz"
  activeMode?: string; // e.g. "USB", "FT8"
  cqZone?: string; // e.g. "22"
  grid?: string; // e.g. "MK7QB"
  profileViews: number;
  profileSearches: number;
  cardsReceived: number;
  cardsSent: number;
  joinedAt: string;
};

export type QSLStatus = "pending" | "accepted" | "rejected" | "sent";

export type QSLCard = {
  id: string;
  templateId: string;
  fromCallsign: string;
  toCallsign: string;
  fromName: string;
  fromAddress: string;
  fromCountry: string;
  ituZone: string;
  date: string;
  utc: string;
  mhz: string;
  mode: string;
  rst: string;
  qslVia: string;
  status: QSLStatus;
  backgroundImage?: string;
  thumbnail?: string;
  createdAt: string;
};

export type QSLTemplate = {
  id: string;
  name: string;
  backgroundColor: string;
  accentColor: string;
  borderColor: string;
  backgroundImage?: string;
  previewImage?: string;
  isAdminCreated: boolean;
};

export type NetworkUser = {
  id: string;
  callsign: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  connectedAt: string;
  status: "follower" | "following" | "request" | "connected";
  // Optional distance used for "Nearby operators" UI
  distanceKm?: number;
};

export type ActivityItem = {
  id: string;
  user: Pick<UserProfile, "callsign" | "avatar" | "name">;
  content: string;
  image?: string;
  timestamp: string;
};

export type AnalyticsData = {
  views: number;
  clicks: number;
  shares: number;
  viewsChange: number;
  clicksChange: number;
  sharesChange: number;
  viewsOverTime: { day: string; views: number }[];
  trafficSources: { name: string; value: number; color: string }[];
  recentActivity: { id: string; message: string; timestamp: string }[];
};

export type BackgroundPreset = {
  id: string;
  name: string;
  url: string;
  category: "gradient" | "pattern" | "photo" | "radio";
};
