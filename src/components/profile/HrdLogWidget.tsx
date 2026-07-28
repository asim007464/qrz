"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    HrdLog?: new (callsign: string) => {
      LoadByCallsign: () => void;
      LoadLastQso: (count: number) => void;
    };
  }
}

const SCRIPT_SRC = "https://www.hrdlog.net/hrdlog.js";
let scriptPromise: Promise<void> | null = null;

function loadHrdLogScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.HrdLog) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      if (window.HrdLog) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load HRDLOG script.")));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load HRDLOG script."));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

type HrdLogWidgetProps = {
  callsign: string;
  lastQsoCount?: number;
  className?: string;
  /** dark = on purple banner; light = standalone white card */
  variant?: "dark" | "light";
};

export function HrdLogWidget({
  callsign,
  lastQsoCount = 10,
  className,
  variant = "light",
}: HrdLogWidgetProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const normalized = callsign.trim().toUpperCase();
  const isDark = variant === "dark";

  useEffect(() => {
    let cancelled = false;
    const container = document.getElementById("hrdlog");
    if (container) container.innerHTML = "www.hrdlog.net";

    if (!normalized) {
      setStatus("idle");
      return () => {
        cancelled = true;
      };
    }

    async function init() {
      setStatus("loading");
      try {
        await loadHrdLogScript();
        if (cancelled || !window.HrdLog) {
          throw new Error("HRDLOG unavailable");
        }

        // Same embed pattern as HRDLOG.net:
        // var ohrdlog = new HrdLog('CALLSIGN');
        // ohrdlog.LoadByCallsign();
        // ohrdlog.LoadLastQso(10);
        const ohrdlog = new window.HrdLog(normalized);
        ohrdlog.LoadByCallsign();
        ohrdlog.LoadLastQso(lastQsoCount);

        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [normalized, lastQsoCount]);

  return (
    <div
      className={cn(
        "hrdlog-embed rounded-2xl border overflow-hidden",
        isDark ? "bg-white/10 border-white/15 text-white" : "bg-white border-gray-200 text-gray-800 shadow-sm",
        className
      )}
    >
      {/* HRDLOG.net script start */}
      <div id="hrdlog">www.hrdlog.net</div>
      {/* HRDLOG.net script stop */}
      {status === "loading" && (
        <p className={cn("mt-2 text-xs", isDark ? "text-white/70" : "text-gray-400")}>
          Loading last QSOs…
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-500">
          Could not load HRDLOG. Check the callsign or try again later.
        </p>
      )}
    </div>
  );
}
