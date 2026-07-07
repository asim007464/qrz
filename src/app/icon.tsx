import { generateAppIcon } from "@/lib/appIcon";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return generateAppIcon(512);
}
