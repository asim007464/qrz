"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { QSLCardTemplate } from "@/components/qsl/QSLCardTemplate";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, X, Send, Share2, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_QSL_TEMPLATE,
  mapQslCard,
  mapQslTemplate,
  type DbQslRow,
} from "@/lib/qslUtils";
import type { QSLCard, QSLTemplate } from "@/types";

export default function QSLDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { profile, isLoggedIn, loading: authLoading } = useAuth();
  const [card, setCard] = useState<QSLCard | null>(null);
  const [template, setTemplate] = useState<QSLTemplate>(DEFAULT_QSL_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      router.replace(`/login?next=/qsl/${id}`);
      return;
    }

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`/api/qsl/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const row = (await res.json()) as DbQslRow;
      setCard(mapQslCard(row));
      setTemplate(mapQslTemplate(row.qsl_templates) || DEFAULT_QSL_TEMPLATE);
      setLoading(false);
    }

    void load();
  }, [authLoading, id, isLoggedIn, router]);

  const updateStatus = async (status: "accepted" | "rejected") => {
    setUpdating(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const res = await fetch(`/api/qsl/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    if (res.ok) {
      setCard((prev) => (prev ? { ...prev, status } : prev));
    }
  };

  const isIncoming =
    card &&
    profile?.callsign &&
    card.toCallsign.toUpperCase() === profile.callsign.toUpperCase() &&
    card.status === "pending";

  if (loading || authLoading) {
    return (
      <AppShell>
        <PageHeader title="QSL Card" backHref="/qsl" />
        <p className="text-center text-gray-500 text-sm py-8">Loading…</p>
      </AppShell>
    );
  }

  if (!card) {
    return (
      <AppShell>
        <PageHeader title="QSL Card" backHref="/qsl" />
        <p className="text-center text-gray-500 text-sm py-8">QSL card not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="QSL Card"
        backHref="/qsl"
        action={
          <Badge variant={card.status === "accepted" ? "success" : "warning"}>
            {card.status}
          </Badge>
        }
      />

      <QSLCardTemplate card={card} template={template} className="mb-6" />

      <Card className="mb-4">
        <h3 className="font-semibold text-ham-purple mb-2">QSO Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Date:</span> {card.date}
          </div>
          <div>
            <span className="text-gray-500">UTC:</span> {card.utc}
          </div>
          <div>
            <span className="text-gray-500">Frequency:</span> {card.mhz} MHz
          </div>
          <div>
            <span className="text-gray-500">Mode:</span> {card.mode}
          </div>
          <div>
            <span className="text-gray-500">RST:</span> {card.rst}
          </div>
          <div>
            <span className="text-gray-500">QSL Via:</span> {card.qslVia}
          </div>
        </div>
      </Card>

      {isIncoming && (
        <div className="flex gap-3 mb-4">
          <Button
            className="flex-1 flex items-center justify-center gap-2"
            disabled={updating}
            onClick={() => updateStatus("accepted")}
          >
            <Check className="w-4 h-4" />
            Accept
          </Button>
          <Button
            variant="danger"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={updating}
            onClick={() => updateStatus("rejected")}
          >
            <X className="w-4 h-4" />
            Reject
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4" />
          Add to Library
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={async () => {
            const url = window.location.href;
            if (navigator.share) await navigator.share({ title: "QSL Card", url });
            else await navigator.clipboard.writeText(url);
          }}
        >
          <Share2 className="w-4 h-4" />
          Share Card
        </Button>
        <Button
          className="flex items-center justify-center gap-2"
          onClick={() => router.push("/qsl/send")}
        >
          <Send className="w-4 h-4" />
          Send Back QSL
        </Button>
      </div>
    </AppShell>
  );
}
