import Link from "next/link";
import { Download } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  searchParams?: { platform?: string };
};

export default function DownloadPage({ searchParams }: Props) {
  const platform = searchParams?.platform;

  return (
    <AppShell>
      <PageHeader title="Download the App" backHref="/menu" />

      <div className="space-y-4">
        <Card className="overflow-hidden p-0">
          <div className="gradient-purple p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  HamSocial Mobile
                </p>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  Upload, share, connect, and manage your QSLs
                </h2>
                <p className="text-sm text-white/80 mt-2">
                  This UI is ready. Replace the placeholder download endpoints
                  with your real APK/IPA files when you have them.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h3 className="font-semibold text-ham-purple text-sm uppercase tracking-widest">
              Android
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Download HamSocial APK from the website.
            </p>
            <div className="mt-4">
              <Link href="/download/android-apk">
                <Button size="lg" className="w-full">
                  Download APK
                </Button>
              </Link>
            </div>
            {platform === "android" && (
              <p className="text-xs text-gray-500 mt-3">
                Android link selected.
              </p>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-ham-purple text-sm uppercase tracking-widest">
              iPhone (iOS)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Download HamSocial placeholder IPA from the website.
            </p>
            <div className="mt-4">
              <Link href="/download/ios-ipa">
                <Button variant="outline" size="lg" className="w-full">
                  Download iOS
                </Button>
              </Link>
            </div>
            {platform === "ios" && (
              <p className="text-xs text-gray-500 mt-3">
                iOS link selected.
              </p>
            )}
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold text-ham-purple mb-2">Why this is placeholder</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            You asked for frontend-first UI. These download routes provide a working
            “download from website” flow now, so you can test the UX. Later,
            connect them to your real mobile build artifacts (APK/IPA).
          </p>
        </Card>
      </div>
    </AppShell>
  );
}

