export async function GET() {
  // Placeholder file so users can test the "download from website" flow.
  const body = "HamSocial APK placeholder - replace with your real build artifact.";

  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="HamSocial.apk"',
    },
  });
}

