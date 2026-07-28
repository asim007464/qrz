import { NextResponse } from "next/server";
import { getAndroidApkRemoteUrl, readAndroidApk } from "@/lib/appDownloads";

export const dynamic = "force-dynamic";

export async function GET() {
  const remoteUrl = getAndroidApkRemoteUrl();
  if (remoteUrl) {
    return NextResponse.redirect(remoteUrl, 302);
  }

  const apk = await readAndroidApk();
  if (!apk) {
    return new NextResponse("QRZ.apk is not available on the server yet.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(new Uint8Array(apk), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="QRZ.apk"',
      "Content-Length": String(apk.length),
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
