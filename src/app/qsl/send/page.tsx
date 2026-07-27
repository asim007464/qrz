"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { QSLCardTemplate } from "@/components/qsl/QSLCardTemplate";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackgroundPicker } from "@/components/profile/BackgroundPicker";
import { backgroundPresets } from "@/lib/constants";
import { DEFAULT_QSL_TEMPLATE } from "@/lib/qslUtils";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Template = {
  id: string;
  name: string;
  background_color: string;
  accent_color: string;
  border_color: string;
  background_image?: string | null;
};

export default function SendQSLPage() {
  const router = useRouter();
  const { isLoggedIn, profile, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedBg, setSelectedBg] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    toCallsign: "",
    date: "",
    utc: "",
    mhz: "",
    mode: "",
    rst: "",
    qslVia: "",
  });

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Template[] | { templates: Template[] }) => {
        const list = Array.isArray(data) ? data : data.templates ?? [];
        setTemplates(list);
        if (list[0]) setSelectedTemplate(list[0].id);
      })
      .catch(() => setTemplates([]));
  }, []);

  const template = templates.find((t) => t.id === selectedTemplate) ?? templates[0];
  const uiTemplate = template
    ? {
        id: template.id,
        name: template.name,
        backgroundColor: template.background_color,
        accentColor: template.accent_color,
        borderColor: template.border_color,
        backgroundImage: template.background_image ?? undefined,
        isAdminCreated: true,
      }
    : DEFAULT_QSL_TEMPLATE;

  const cardData = {
    fromCallsign: profile?.callsign || "CALL",
    fromName: profile?.name || "Operator",
    fromAddress: "",
    fromCountry: "",
    ituZone: "",
    toCallsign: form.toCallsign,
    date: form.date,
    utc: form.utc,
    mhz: form.mhz,
    mode: form.mode,
    rst: form.rst,
    qslVia: form.qslVia,
    backgroundImage: selectedBg
      ? backgroundPresets.find((b) => b.id === selectedBg)?.url.startsWith("linear")
        ? undefined
        : backgroundPresets.find((b) => b.id === selectedBg)?.url
      : undefined,
  };

  const send = async () => {
    if (!form.toCallsign.trim()) {
      setError("Recipient callsign is required.");
      return;
    }
    setSending(true);
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      router.push("/login?next=/qsl/send");
      return;
    }
    const res = await fetch("/api/qsl", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to_callsign: form.toCallsign,
        template_id: selectedTemplate,
        qso_date: form.date,
        qso_utc: form.utc,
        mhz: form.mhz,
        mode: form.mode,
        rst: form.rst,
        qsl_via: form.qslVia,
        background_image: cardData.backgroundImage,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Could not send QSL card.");
      return;
    }
    router.push("/qsl");
  };

  if (!authLoading && !isLoggedIn) {
    router.replace("/login?next=/qsl/send");
    return null;
  }

  return (
    <AppShell>
      <PageHeader title="Send QSL Card" backHref="/add" />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4 order-2 lg:order-1">
          <Card>
            <h3 className="font-semibold text-ham-purple mb-3">Select QSL Template</h3>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id)}
                  className={cn(
                    "rounded-xl p-3 border-2 text-left transition-all",
                    selectedTemplate === t.id ? "border-ham-accent ring-2 ring-ham-accent/20" : "border-gray-200"
                  )}
                >
                  <div className="w-full h-12 rounded-lg mb-2" style={{ backgroundColor: t.background_color }} />
                  <p className="text-xs font-medium text-gray-800">{t.name}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-semibold text-ham-purple">QSO Details</h3>
            <Input label="To Callsign" placeholder="e.g. DL9XX" value={form.toCallsign} onChange={(e) => setForm({ ...form, toCallsign: e.target.value.toUpperCase() })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input label="UTC Time" placeholder="14:32" value={form.utc} onChange={(e) => setForm({ ...form, utc: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="MHz" placeholder="14.230" value={form.mhz} onChange={(e) => setForm({ ...form, mhz: e.target.value })} />
              <Input label="Mode" placeholder="FT8" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} />
              <Input label="RST" placeholder="599" value={form.rst} onChange={(e) => setForm({ ...form, rst: e.target.value })} />
            </div>
            <Input label="QSL Via" placeholder="LoTW, eQSL, Direct, QRZ.INFO" value={form.qslVia} onChange={(e) => setForm({ ...form, qslVia: e.target.value })} />
          </Card>

          <Card>
            <BackgroundPicker presets={backgroundPresets} selectedId={selectedBg} onSelect={(p) => setSelectedBg(p.id)} label="QSL Card Background" />
          </Card>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button size="lg" onClick={send} disabled={sending}>{sending ? "Sending…" : "Send QSL Card"}</Button>
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-6 max-w-md mx-auto lg:max-w-none w-full">
          <p className="text-sm font-medium text-gray-500 mb-3 text-center">Preview</p>
          <QSLCardTemplate card={cardData} template={uiTemplate} editable />
        </div>
      </div>
    </AppShell>
  );
}
