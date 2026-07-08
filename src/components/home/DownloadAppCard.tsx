"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type DownloadAppCardProps = {
  className?: string;
};

export function DownloadAppCard({ className }: DownloadAppCardProps) {
  return (
    <Card
      padding={false}
      className={cn("overflow-hidden border border-gray-100", className)}
    >
      <div className="gradient-purple p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Download the app
            </p>
            <h3 className="text-lg sm:text-xl font-bold mt-1">
              HamSocial for iOS & Android
            </h3>
            <p className="text-sm text-white/80 mt-2">
              Upload your profile, share QSL cards, build connections, and track
              views/searches.
            </p>
          </div>

          <div className="hidden sm:block">
            {/* Simple phone mock (no external assets) */}
            <div className="relative w-40 h-72 rounded-[2rem] border border-white/20 bg-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
              <div className="absolute top-3 left-3 text-[10px] font-bold text-white/80">
                HAM
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="h-10 rounded-2xl bg-white/15" />
                <div className="h-3 mt-3 rounded-xl bg-white/10" />
              </div>
              <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          If you want, tell me your real APK/App Store link and I’ll replace the
          placeholders.
        </div>
        <div className="flex gap-2">
          <Link href="/download?platform=android" className="flex-1 sm:flex-none">
            <Button variant="primary" className="w-full">
              Download Android
            </Button>
          </Link>
          <Link href="/download?platform=ios" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              Download iOS
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

