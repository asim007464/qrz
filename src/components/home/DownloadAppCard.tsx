"use client";

import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/AppIcon";
import { cn } from "@/lib/utils";

type DownloadAppCardProps = {
  className?: string;
};

const MOCK_IMAGE =
  "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&q=80";

export function DownloadAppCard({ className }: DownloadAppCardProps) {
  return (
    <Card
      padding={false}
      className={cn("overflow-hidden border border-gray-100", className)}
    >
      <div className="gradient-purple p-5 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">
              Download the app
            </p>
            <h3 className="text-lg sm:text-xl font-bold mt-1">QRZ for iOS & Android</h3>
            <p className="text-sm text-white/80 mt-2">
              Upload your profile, share QSL cards, build connections, and track views/searches.
            </p>
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
                  alt="Ham radio station"
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
          <span>Get QRZ on your phone with the official app icon on your home screen.</span>
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
