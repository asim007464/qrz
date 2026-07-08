export async function GET() {
  // Placeholder file so users can test the "download from website" flow.
  const body = "HamSocial iOS placeholder - replace with your real IPA build artifact.";

  return new Response(body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="HamSocial.ipa"',
    },
  });
}

