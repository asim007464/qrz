import type { BackgroundPreset } from "@/types";

/** Max upload size for profile/feed images */
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_IMAGE_SIZE_LABEL = `${MAX_IMAGE_SIZE_MB}MB`;

export const backgroundPresets: BackgroundPreset[] = [
  {
    id: "bg1",
    name: "Radio Waves",
    url: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=80",
    category: "radio",
  },
  {
    id: "bg2",
    name: "Antenna Tower",
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
    category: "radio",
  },
  {
    id: "bg3",
    name: "Sunset DX",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    category: "photo",
  },
  {
    id: "bg4",
    name: "Ocean",
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80",
    category: "photo",
  },
  {
    id: "bg5",
    name: "Purple Gradient",
    url: "linear-gradient(135deg, #2E1A47 0%, #5B3A8C 100%)",
    category: "gradient",
  },
  {
    id: "bg6",
    name: "Teal Vintage",
    url: "linear-gradient(180deg, #1E4D5C 0%, #0D3339 100%)",
    category: "gradient",
  },
];
