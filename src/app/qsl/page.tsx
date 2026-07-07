"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Bell, Scan, Send, Inbox, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { QSLListItem, QSLStatCard } from "@/components/qsl/QSLListItem";
import { qslCards } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";

const quickActions = [
  { icon: Scan, label: "Scan", href: "/add" },
  { icon: Send, label: "Send", href: "/qsl/send" },
  { icon: Inbox, label: "Receive", href: "/qsl" },
  { icon: Share2, label: "Share", action: "share" as const },
];

export default function QSLWalletPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("my");

  const callsign = profile?.callsign || "K2ABC";

  const filtered = qslCards.filter((c) => {
    if (activeTab === "sent") return c.fromCallsign === callsign;
    if (activeTab === "received") return c.toCallsign === callsign;
    return true;
  });

  const tabs = [
    { id: "my", label: "My QSLs", count: qslCards.length },
    { id: "sent", label: "Sent", count: qslCards.filter((c) => c.fromCallsign === callsign).length },
    { id: "received", label: "Received", count: qslCards.filter((c) => c.toCallsign === callsign).length },
  ];

  const handleQuick = async (item: (typeof quickActions)[number]) => {
    if (item.action === "share") {
      const url = window.location.href;
      if (navigator.share) await navigator.share({ title: "My QSL Wallet", url });
      else await navigator.clipboard.writeText(url);
      return;
    }
    if (item.href) router.push(item.href);
  };

  return (
    <AppShell>
      <PageHeader
        title="QSL Wallet"
        action={
          <div className="flex gap-2">
            <Link href="/menu" className="p-2 rounded-xl hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-600" />
            </Link>
            <Link href="/contact" className="p-2 rounded-xl hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-2 mb-4">
        <QSLStatCard label="Total" value={qslCards.length} />
        <QSLStatCard label="Sent" value={tabs[1].count ?? 0} />
        <QSLStatCard label="Received" value={tabs[2].count ?? 0} />
        <QSLStatCard label="New" value={qslCards.filter((c) => c.status === "pending").length} highlight />
      </div>

      <div className="flex justify-around mb-4 bg-white rounded-2xl p-3 card-shadow border border-gray-100">
        {quickActions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleQuick(item)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-ham-purple/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-ham-purple" />
            </div>
            <span className="text-xs text-gray-600 font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-4" />

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-gray-500 text-sm">No QSL cards yet. <Link href="/qsl/send" className="text-ham-accent">Send one</Link></p>
        ) : (
          filtered.map((card) => <QSLListItem key={card.id} card={card} />)
        )}
      </div>
    </AppShell>
  );
}
