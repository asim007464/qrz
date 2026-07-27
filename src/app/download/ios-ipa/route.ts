export async function GET() {
  const body = "QRZ iOS placeholder - replace with your real IPA build artifact.";

  return new Response(body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="QRZ.ipa"',
    },
  });
}

