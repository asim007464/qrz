import { NextResponse } from "next/server";
import { readAndroidApk } from "@/lib/appDownloads";
import { getSiteUrl } from "@/lib/siteUrl";

export async function GET() {
  const apk = await readAndroidApk();

  if (!apk) {
    return NextResponse.redirect(
      new URL("/download?platform=android&missing=apk", getSiteUrl()),
      302,
    );
  }

  return new Response(new Uint8Array(apk), {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="QRZ.apk"',
      "Content-Length": String(apk.length),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
