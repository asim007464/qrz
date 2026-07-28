"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/AppIcon";
import { useSiteCopy } from "@/hooks/useSiteCopy";

function startDownload(href: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.setAttribute("download", href.endsWith("ios-ipa") ? "QRZ.ipa" : "QRZ.apk");
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function DownloadPageContent() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform") || undefined;
  const { t } = useSiteCopy();

  useEffect(() => {
    if (platform === "android") startDownload("/download/android-apk");
    if (platform === "ios") startDownload("/download/ios-ipa");
  }, [platform]);

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
              <Button
                size="lg"
                className="w-full"
                onClick={() => startDownload("/download/android-apk")}
              >
                {t("download.android_cta")}
              </Button>
            </div>
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
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => startDownload("/download/ios-ipa")}
              >
                {t("download.ios_cta")}
              </Button>
            </div>
          </Card>
        </div>
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
