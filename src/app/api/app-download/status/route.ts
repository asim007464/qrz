import { androidApkAvailable, iosIpaAvailable } from "@/lib/appDownloads";

export async function GET() {
  const [androidApk, iosIpa] = await Promise.all([androidApkAvailable(), iosIpaAvailable()]);

  return Response.json({ androidApk, iosIpa });
}
