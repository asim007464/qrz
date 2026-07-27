import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/AppIcon";

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
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  QRZ Mobile
                </p>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  Upload, share, connect, and manage your QSLs
                </h2>
                <p className="text-sm text-white/80 mt-2">
                  Install QRZ on your phone to access the ham radio social network on the go.
                </p>
              </div>
              <AppIcon size={72} className="shrink-0 shadow-lg border border-white/20" />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <AppIcon size={44} />
              <div>
                <h3 className="font-semibold text-ham-purple text-sm uppercase tracking-widest">
                  Android
                </h3>
                <p className="text-xs text-gray-500">QRZ for Android</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Download the QRZ APK from the website.
            </p>
            <div className="mt-4">
              <Link href="/download/android-apk">
                <Button size="lg" className="w-full">
                  Download APK
                </Button>
              </Link>
            </div>
            {platform === "android" && (
              <p className="text-xs text-gray-500 mt-3">Android link selected.</p>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <AppIcon size={44} />
              <div>
                <h3 className="font-semibold text-ham-purple text-sm uppercase tracking-widest">
                  iPhone (iOS)
                </h3>
                <p className="text-xs text-gray-500">QRZ for iOS</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Download the QRZ app for iPhone from the website.
            </p>
            <div className="mt-4">
              <Link href="/download/ios-ipa">
                <Button variant="outline" size="lg" className="w-full">
                  Download iOS
                </Button>
              </Link>
            </div>
            {platform === "ios" && (
              <p className="text-xs text-gray-500 mt-3">iOS link selected.</p>
            )}
          </Card>
        </div>

        <Card className="p-4 flex items-center gap-4">
          <AppIcon size={56} className="shrink-0 hidden sm:block" />
          <div>
            <h3 className="font-semibold text-ham-purple mb-1">App icon on your home screen</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              After installing, the QRZ icon appears on your device like any other app. Replace the
              placeholder APK/IPA files with your real mobile builds when they are ready.
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
