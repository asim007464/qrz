"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/AppIcon";
import { useSiteCopy } from "@/hooks/useSiteCopy";

function startDownload(href: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.setAttribute("download", filename);
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
    if (platform === "android") {
      startDownload("/download/android-apk", "QRZ.apk");
    }
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
                onClick={() => startDownload("/download/android-apk", "QRZ.apk")}
              >
                {t("download.android_cta")}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              After download, open the APK and allow install from this browser if Android asks.
            </p>
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <p className="font-semibold mb-1">{t("download.play_protect_title")}</p>
              <p className="text-xs leading-relaxed mb-2">{t("download.play_protect_body")}</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>{t("download.play_protect_step1")}</li>
                <li>{t("download.play_protect_step2")}</li>
                <li>{t("download.play_protect_step3")}</li>
              </ol>
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
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-medium text-ham-purple mb-1">Add to Home Screen</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Safari on iPhone.</li>
                <li>Tap Share → Add to Home Screen.</li>
                <li>Tap Add to install QRZ.</li>
              </ol>
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
