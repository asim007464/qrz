"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
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

function matchesQuery(qso: HrdLogQso, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    qso.station,
    qso.callsign,
    qso.startTime,
    qso.band,
    qso.mode,
    qso.rstRecv,
    qso.rstSent,
    qso.dxcc,
    qso.comment,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function HrdLogWidget({
  callsign,
  lastQsoCount = 25,
  className,
  variant = "light",
}: HrdLogWidgetProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [qsos, setQsos] = useState<HrdLogQso[]>([]);
  const [logbookUrl, setLogbookUrl] = useState("");
  const [search, setSearch] = useState("");
  const normalized = callsign.trim().toUpperCase();
  const isValidCallsign = HRDLOG_CALLSIGN_RE.test(normalized);
  const isDark = variant === "dark";

  const filteredQsos = useMemo(
    () => qsos.filter((qso) => matchesQuery(qso, search)),
    [qsos, search],
  );

  useEffect(() => {
    if (!normalized || !isValidCallsign) {
      setStatus("idle");
      setQsos([]);
      setError("");
      setSearch("");
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

      {(status === "ready" || status === "loading") && (
        <div className="mb-3">
          <label className="relative block">
            <Search
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                isDark ? "text-white/55" : "text-gray-400",
              )}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search DX, date, band, mode…"
              className={cn(
                "hrdlog-search w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm outline-none transition",
                isDark
                  ? "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/15"
                  : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-ham-purple focus:bg-white",
              )}
              aria-label="Search last QSOs"
            />
          </label>
          {status === "ready" && search.trim() && (
            <p className={cn("mt-1.5 text-[11px]", isDark ? "text-white/65" : "text-gray-500")}>
              {filteredQsos.length} of {qsos.length} QSO{qsos.length === 1 ? "" : "s"} match
            </p>
          )}
        </div>
      )}

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

      {status === "ready" && qsos.length > 0 && filteredQsos.length === 0 && (
        <p className={cn("text-xs", isDark ? "text-white/70" : "text-gray-500")}>
          No QSOs match “{search.trim()}”.
        </p>
      )}

      {status === "ready" && filteredQsos.length > 0 && (
        <div className="hrdlog-table-scroll overflow-auto -mx-1">
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
              {filteredQsos.map((qso, index) => (
                <tr
                  key={`${qso.station}-${qso.startTime}-${index}`}
                  className={index % 2 ? "hrdl_even" : "hrdl_odd"}
                >
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
