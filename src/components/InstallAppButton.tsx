"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallAppButtonProps = {
  label: string;
  className?: string;
  variant?: "primary" | "outline";
};

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function InstallAppButton({
  label,
  className,
  variant = "primary",
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIosDevice());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  }

  if (installed) {
    return (
      <p className={cn("text-sm text-green-700 font-medium", className)}>
        QRZ is already installed on this device.
      </p>
    );
  }

  if (deferredPrompt) {
    return (
      <Button
        size="lg"
        variant={variant === "outline" ? "outline" : "primary"}
        className={cn("w-full", className)}
        onClick={handleInstall}
      >
        {label}
      </Button>
    );
  }

  if (ios) {
    return (
      <div className={cn("rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600", className)}>
        <p className="font-medium text-ham-purple mb-1">Add QRZ to your home screen</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Tap the Share button in Safari.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong> to install QRZ.</li>
        </ol>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600", className)}>
      <p className="font-medium text-ham-purple mb-1">Install QRZ from your browser</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Open this page in Chrome on Android.</li>
        <li>Tap the menu (three dots).</li>
        <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
      </ol>
    </div>
  );
}
