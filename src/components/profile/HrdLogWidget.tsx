"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type HrdLogQso = {
  callsign: string;
  station: string;
  startTime: string;
  band: string;
  mode: string;
  rstRecv: string;
  rstSent: string;
  dxcc: string;
  comment: string;
};

type HrdLogResponse = {
  callsign: string;
  qsos: HrdLogQso[];
  logbookUrl: string;
  error?: string;
};

const HRDLOG_CALLSIGN_RE = /^[A-Z0-9/-]{3,16}$/i;

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
  const [error, setError] = useState("");
  const [qsos, setQsos] = useState<HrdLogQso[]>([]);
  const [logbookUrl, setLogbookUrl] = useState("");
  const normalized = callsign.trim().toUpperCase();
  const isValidCallsign = HRDLOG_CALLSIGN_RE.test(normalized);
  const isDark = variant === "dark";

  useEffect(() => {
    if (!normalized || !isValidCallsign) {
      setStatus("idle");
      setQsos([]);
      setError("");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      setError("");
      try {
        const res = await fetch(
          `/api/hrdlog?callsign=${encodeURIComponent(normalized)}&limit=${lastQsoCount}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const data = (await res.json()) as HrdLogResponse;
        if (!res.ok) {
          throw new Error(data.error || "Could not load HRDLOG.");
        }
        if (cancelled) return;
        setQsos(data.qsos || []);
        setLogbookUrl(data.logbookUrl || "");
        setStatus("ready");
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setError(err instanceof Error ? err.message : "Could not load HRDLOG.");
        setStatus("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [normalized, isValidCallsign, lastQsoCount]);

  if (!normalized || !isValidCallsign) return null;

  return (
    <div
      className={cn(
        "hrdlog-embed rounded-2xl border overflow-hidden",
        isDark
          ? "hrdlog-embed--dark bg-white/10 border-white/15 text-white"
          : "bg-white border-gray-200 text-gray-800 shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "hrdlog-embed__head flex items-center justify-between gap-3 px-1 pb-3 mb-3",
          isDark ? "border-b border-white/15" : "border-b border-gray-100",
        )}
      >
        <div>
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isDark ? "text-white/70" : "text-gray-500",
            )}
          >
            HRDLOG.net
          </p>
          <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-ham-purple")}>
            Last QSOs · {normalized}
          </p>
        </div>
        {logbookUrl && (
          <a
            href={logbookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-xs underline shrink-0",
              isDark ? "text-white/80 hover:text-white" : "text-ham-purple",
            )}
          >
            Full logbook
          </a>
        )}
      </div>

      {status === "loading" && (
        <p className={cn("text-xs", isDark ? "text-white/70" : "text-gray-400")}>
          Loading last QSOs…
        </p>
      )}

      {status === "error" && (
        <p className="text-xs text-red-500">
          {error || "Could not load HRDLOG. Check the callsign or try again later."}
        </p>
      )}

      {status === "ready" && qsos.length === 0 && (
        <p className={cn("text-xs", isDark ? "text-white/70" : "text-gray-500")}>
          No public QSOs found for {normalized} on HRDLOG.net.
        </p>
      )}

      {status === "ready" && qsos.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="hrdl_table w-full text-left">
            <thead>
              <tr>
                <th>DX</th>
                <th>Date</th>
                <th>Band</th>
                <th>Mode</th>
                <th>RSTr</th>
                <th>RSTs</th>
              </tr>
            </thead>
            <tbody>
              {qsos.map((qso, index) => (
                <tr key={`${qso.station}-${qso.startTime}-${index}`} className={index % 2 ? "hrdl_even" : "hrdl_odd"}>
                  <td className="font-semibold whitespace-nowrap">{qso.station || "—"}</td>
                  <td className="whitespace-nowrap">{qso.startTime || "—"}</td>
                  <td>{qso.band || "—"}</td>
                  <td>{qso.mode || "—"}</td>
                  <td>{qso.rstRecv || "—"}</td>
                  <td>{qso.rstSent || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
