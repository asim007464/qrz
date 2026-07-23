"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ProfileQRCodeProps = {
  callsign: string;
  size?: number;
};

function profileUrl(callsign: string): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : site || "https://qrz.info";
  // Prefer configured public site URL so phones can open the link (not localhost).
  const base =
    site && !site.includes("localhost")
      ? site
      : origin.includes("localhost") && site
        ? site
        : origin;
  return `${base}/profile/${encodeURIComponent(callsign)}`;
}

function fallbackQrSrc(href: string, pixels: number): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${pixels}x${pixels}&margin=8&data=${encodeURIComponent(href)}`;
}

export function ProfileQRCode({ callsign, size = 96 }: ProfileQRCodeProps) {
  const href = useMemo(() => profileUrl(callsign), [callsign]);
  const [src, setSrc] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(href, {
          margin: 1,
          width: 512,
          errorCorrectionLevel: "M",
          color: {
            dark: "#2e1a47",
            light: "#ffffff",
          },
        });
        if (!cancelled) setSrc(dataUrl);
      } catch (err) {
        console.error("QR generation error, using fallback:", err);
        if (!cancelled) setSrc(fallbackQrSrc(href, 512));
      }
    }

    void generate();
    return () => {
      cancelled = true;
    };
  }, [href]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
        aria-label={`Show QR code for ${callsign}`}
        title="Tap to enlarge QR"
      >
        <div className="bg-white p-1.5 rounded-lg">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`Scan to open ${callsign} profile`}
              width={size}
              height={size}
              className="rounded-md"
              style={{ width: size, height: size }}
            />
          ) : (
            <div
              className="animate-pulse rounded-md bg-gray-100"
              style={{ width: size, height: size }}
            />
          )}
        </div>
        <span className="mt-1 block text-center text-[10px] text-white/70">
          Scan to connect
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Profile QR code"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-sm font-semibold text-ham-purple pr-8">
              Connect with {callsign}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Scan this code to open the profile on QRZ.
            </p>

            <div className="mt-4 flex justify-center">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`QR code for ${callsign}`}
                  className="w-56 h-56 rounded-xl border border-gray-100"
                />
              ) : (
                <div className="w-56 h-56 animate-pulse rounded-xl bg-gray-100" />
              )}
            </div>

            <p className="mt-3 break-all text-center text-[11px] text-gray-400">{href}</p>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                size="sm"
                className="w-full inline-flex items-center justify-center gap-1.5"
                onClick={() => void copyLink()}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Link copied" : "Copy profile link"}
              </Button>
              <a href={href} className="block">
                <Button type="button" size="sm" variant="outline" className="w-full">
                  Open profile
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
