import { NextResponse } from "next/server";
import { getIosIpaRemoteUrl, readIosIpa } from "@/lib/appDownloads";

export const dynamic = "force-dynamic";

export async function GET() {
  const remoteUrl = getIosIpaRemoteUrl();
  if (remoteUrl) {
    return NextResponse.redirect(remoteUrl, 302);
  }

  const ipa = await readIosIpa();
  if (!ipa) {
    return new NextResponse("QRZ.ipa is not available on the server yet.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(new Uint8Array(ipa), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="QRZ.ipa"',
      "Content-Length": String(ipa.length),
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
