import { NextResponse } from "next/server";
import { readIosIpa } from "@/lib/appDownloads";
import { getSiteUrl } from "@/lib/siteUrl";

export async function GET() {
  const ipa = await readIosIpa();

  if (!ipa) {
    return NextResponse.redirect(
      new URL("/download?platform=ios&missing=ipa", getSiteUrl()),
      302,
    );
  }

  return new Response(new Uint8Array(ipa), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="QRZ.ipa"',
      "Content-Length": String(ipa.length),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
