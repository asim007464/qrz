import type { NextConfig } from "next";
import { MAX_IMAGE_SIZE_MB } from "./src/lib/constants";

/** Room for base64 overhead + form fields beyond raw image limit */
const API_BODY_LIMIT = `${MAX_IMAGE_SIZE_MB + 3}mb`;

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: API_BODY_LIMIT,
    serverActions: {
      bodySizeLimit: API_BODY_LIMIT,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
