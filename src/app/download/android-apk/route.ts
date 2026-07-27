export async function GET() {
  const body = "QRZ APK placeholder - replace with your real build artifact.";

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="QRZ.apk"',
    },
  });
}

