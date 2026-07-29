"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/AppIcon";
import { cn } from "@/lib/utils";
import { useSiteCopy } from "@/hooks/useSiteCopy";

type DownloadAppCardProps = {
  className?: string;
};

const MOCK_IMAGE =
  "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&q=80";

export function DownloadAppCard({ className }: DownloadAppCardProps) {
  const { t } = useSiteCopy();

  return (
    <Card
      padding={false}
      className={cn("overflow-hidden border border-gray-100", className)}
    >
      <div className="gradient-purple p-5 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              {t("home.download_eyebrow")}
            </p>
            <h3 className="text-lg sm:text-xl font-bold mt-1">{t("home.download_title")}</h3>
            <p className="text-sm text-white/80 mt-2">{t("home.download_body")}</p>
          </div>

          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="relative w-40 h-72 rounded-[2rem] border border-white/25 bg-white/10 overflow-hidden backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />

              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                <AppIcon size={22} className="rounded-md" />
                <span className="text-[10px] font-bold tracking-wide text-white/90">QRZ</span>
              </div>
              <div className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                <Download className="w-5 h-5 text-white" />
              </div>

              <div className="absolute inset-x-3 top-12 bottom-14 rounded-2xl overflow-hidden border border-white/20 bg-white/10">
                <Image
                  src={MOCK_IMAGE}
                  alt="Radio station"
                  fill
                  className="object-cover"
                  sizes="160px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2e1a47]/70 via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2">
                <AppIcon size={36} className="rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-2.5 rounded-md bg-white/20 border border-white/10" />
                  <div className="h-2 mt-1.5 rounded-md bg-white/10 border border-white/10 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <AppIcon size={40} className="shrink-0 sm:hidden" />
          <span>{t("home.download_footer")}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="w-full sm:w-auto flex-1 sm:flex-none"
            onClick={() => {
              const a = document.createElement("a");
              a.href = "/download/android-apk";
              a.setAttribute("download", "QRZ.apk");
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
          >
            {t("home.download_android_cta")}
          </Button>
          <a href="/download?platform=ios" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              {t("home.download_ios_cta")}
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
