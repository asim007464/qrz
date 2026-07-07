"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Radio, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { OpenRepeaterItem } from "@/lib/openRepeater";
import { OPENREPEATER_SITE } from "@/lib/openRepeater";

function repeaterDetailHref(callsign: string) {
  return `${OPENREPEATER_SITE}/repeater/${encodeURIComponent(callsign.trim().toLowerCase())}`;
}

export default function RepeatersPage() {
  const [repeaters, setRepeaters] = useState<OpenRepeaterItem[]>([]);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [band, setBand] = useState("");
  const [mode, setMode] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (band) params.set("band", band);
    if (mode) params.set("mode", mode);
    params.set("limit", "100");
    try {
      const res = await fetch(`/api/repeaters?${params}`);
      const data = await res.json();
      setRepeaters(data.repeaters ?? []);
      setTotal(data.total ?? 0);
      setSource(data.source ?? "");
    } finally {
      setLoading(false);
    }
  }, [q, band, mode]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      <PageHeader title="Repeaters" backHref="/" />

      <Card className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search callsign, city, country…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-ham-accent focus:outline-none focus:ring-2 focus:ring-ham-accent/20"
            />
          </div>
          <Button onClick={load} className="w-full sm:w-auto shrink-0">Search</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={band}
            onChange={(e) => setBand(e.target.value)}
            className="flex-1 sm:flex-none min-w-0 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">All bands</option>
            {["2m", "70cm", "6m", "10m", "23cm", "33cm"].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="flex-1 sm:flex-none min-w-0 rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">All modes</option>
            {["FM", "DMR", "D-Star", "Fusion", "YSF", "P25", "NXDN"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500">
          {total > 0 ? `${total.toLocaleString()} repeaters` : "Repeater list"}
          {" · "}
          <a href={OPENREPEATER_SITE} target="_blank" rel="noopener noreferrer" className="text-ham-accent hover:underline inline-flex items-center gap-0.5">
            Open Repeater <ExternalLink className="w-3 h-3" />
          </a>
          {source ? ` · ${source}` : ""}
        </p>
      </Card>

      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading repeaters…</p>
      ) : repeaters.length === 0 ? (
        <Card className="text-center py-12">
          <Radio className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No repeaters in the list yet.</p>
          <p className="text-sm text-gray-500 mb-4">
            Browse the full directory or add a repeater on Open Repeater.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a href={`${OPENREPEATER_SITE}/search`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Search on Open Repeater</Button>
            </a>
            <a href={`${OPENREPEATER_SITE}/add`} target="_blank" rel="noopener noreferrer">
              <Button>Add Repeater</Button>
            </a>
          </div>
        </Card>
      ) : (
        <ul className="space-y-2" role="list">
          {repeaters.map((r) => (
            <li key={r.id || r.callsign}>
              <a
                href={repeaterDetailHref(r.callsign)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="flex flex-col sm:flex-row sm:items-center gap-3 hover:border-ham-accent/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-ham-purple text-lg">{r.callsign}</h3>
                      <Badge variant={r.status === "active" ? "success" : "default"}>
                        {r.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                      <Badge>{r.band}</Badge>
                      <Badge>{r.mode}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {[r.city, r.country].filter(Boolean).join(", ") || "—"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {r.frequency != null ? `${r.frequency} MHz` : "—"}
                      {r.offset != null ? ` · offset ${r.offset} kHz` : ""}
                      {r.ctcss != null ? ` · ${r.ctcss} Hz` : ""}
                      {r.coverage_km ? ` · ${r.coverage_km} km` : ""}
                    </p>
                    {r.owner && <p className="text-xs text-gray-400 mt-1">Owner: {r.owner}</p>}
                  </div>
                  <span className="shrink-0 text-xs font-medium text-ham-accent flex items-center gap-1">
                    View on Open Repeater <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </Card>
              </a>
            </li>
          ))}
        </ul>
      )}

      {!loading && repeaters.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          <a
            href={`${OPENREPEATER_SITE}/search`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ham-accent hover:underline inline-flex items-center gap-1"
          >
            View full repeater directory on Open Repeater <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </p>
      )}
    </AppShell>
  );
}
