"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { adminFetch } from "@/components/admin/useAdminData";
import { fmtUTC } from "@/lib/utils";

type AdminQsl = {
  id: string;
  from_callsign: string;
  to_callsign: string;
  from_name: string;
  from_country: string;
  qso_date: string | null;
  qso_utc: string;
  mhz: string;
  mode: string;
  rst: string;
  qsl_via: string;
  status: string;
  created_at: string;
  qsl_templates?: { name: string } | null;
};

export default function AdminQslPage() {
  const [cards, setCards] = useState<AdminQsl[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/qsl");
    if (res.ok) {
      setCards(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function deleteCard(id: string) {
    if (!confirm("Delete this QSL card? This cannot be undone.")) return;
    setBusyId(id);
    const res = await adminFetch(`/api/admin/qsl/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not delete QSL card.");
    } else {
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
    setBusyId("");
  }

  if (loading) return <p className="section-sub">Loading QSL cards…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>QSL Cards</h1>
          <p className="section-sub">{cards.length} cards sent across the network.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      <div className="admin-support-list">
        {cards.length === 0 && <p className="section-sub">No QSL cards yet.</p>}
        {cards.map((card) => (
          <div key={card.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <strong>
                  {card.from_callsign} → {card.to_callsign}
                </strong>
                <p className="section-sub no-cap" style={{ marginTop: 4 }}>
                  {card.from_name}
                  {card.from_country ? ` · ${card.from_country}` : ""} · {fmtUTC(card.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`support-status support-status--${card.status === "accepted" ? "resolved" : "open"}`}>
                  {card.status}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={busyId === card.id}
                  onClick={() => void deleteCard(card.id)}
                >
                  <Trash2 size={16} />
                  {busyId === card.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600 mt-2">
              <p><span className="font-medium text-gray-800">Date:</span> {card.qso_date || "—"}</p>
              <p><span className="font-medium text-gray-800">UTC:</span> {card.qso_utc || "—"}</p>
              <p><span className="font-medium text-gray-800">MHz:</span> {card.mhz || "—"}</p>
              <p><span className="font-medium text-gray-800">Mode:</span> {card.mode || "—"}</p>
              <p><span className="font-medium text-gray-800">RST:</span> {card.rst || "—"}</p>
              <p><span className="font-medium text-gray-800">QSL Via:</span> {card.qsl_via || "—"}</p>
              <p><span className="font-medium text-gray-800">Template:</span> {card.qsl_templates?.name || "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
