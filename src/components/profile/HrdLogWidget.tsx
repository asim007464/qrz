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
};

export function HrdLogWidget({
  callsign,
  lastQsoCount = 10,
  className,
}: HrdLogWidgetProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const normalized = callsign.trim().toUpperCase();

  useEffect(() => {
    if (!normalized) return;

    let cancelled = false;
    const container = document.getElementById("hrdlog");
    if (container) container.innerHTML = "www.hrdlog.net";

    async function init() {
      setStatus("loading");
      try {
        await loadHrdLogScript();
        if (cancelled || !window.HrdLog) {
          throw new Error("HRDLOG unavailable");
        }

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

  if (!normalized) return null;

  return (
    <div
      className={cn(
        "rounded-xl bg-white/10 border border-white/15 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Log</p>
        <a
          href={`https://www.hrdlog.net/ViewLogbook.aspx?Callsign=${encodeURIComponent(normalized)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/60 hover:text-white underline truncate"
        >
          HRDLOG.net · {normalized}
        </a>
      </div>
      <div className="p-3 min-h-[120px] bg-white text-gray-800 text-xs overflow-x-auto">
        {/* HRDLOG.net script target */}
        <div id="hrdlog">www.hrdlog.net</div>
        {status === "loading" && (
          <p className="mt-2 text-gray-400">Loading last QSOs…</p>
        )}
        {status === "error" && (
          <p className="mt-2 text-red-500">
            Could not load HRDLOG. Check the callsign or try again later.
          </p>
        )}
      </div>
    </div>
  );
}
