"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/AppIcon";
import { useSiteCopy } from "@/hooks/useSiteCopy";

function DownloadPageContent() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || undefined;
  const { t } = useSiteCopy();

  return (
    <AppShell>
      <PageHeader title={t("download.title")} backHref="/menu" />

      <div className="space-y-4">
        <Card className="overflow-hidden p-0">
          <div className="gradient-purple p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  {t("download.eyebrow")}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  {t("download.headline")}
                </h2>
                <p className="text-sm text-white/80 mt-2">{t("download.body")}</p>
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
                  {t("download.android_title")}
                </h3>
                <p className="text-xs text-gray-500">{t("download.android_subtitle")}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{t("download.android_body")}</p>
            <div className="mt-4">
              <Link href="/download/android-apk">
                <Button size="lg" className="w-full">
                  {t("download.android_cta")}
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
                  {t("download.ios_title")}
                </h3>
                <p className="text-xs text-gray-500">{t("download.ios_subtitle")}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{t("download.ios_body")}</p>
            <div className="mt-4">
              <Link href="/download/ios-ipa">
                <Button variant="outline" size="lg" className="w-full">
                  {t("download.ios_cta")}
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

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <PageHeader title="Download the App" backHref="/menu" />
          <p className="text-sm text-gray-500">Loading…</p>
        </AppShell>
      }
    >
      <DownloadPageContent />
    </Suspense>
  );
}
