"use client";

import { useState } from "react";
import { Menu, Bell, Scan, Send, Inbox, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { QSLListItem, QSLStatCard } from "@/components/qsl/QSLListItem";
import { qslCards } from "@/lib/mock-data";

const quickActions = [
  { icon: Scan, label: "Scan" },
  { icon: Send, label: "Send" },
  { icon: Inbox, label: "Receive" },
  { icon: Share2, label: "Share" },
];

export default function QSLWalletPage() {
  const [activeTab, setActiveTab] = useState("my");

  const filtered = qslCards.filter((c) => {
    if (activeTab === "sent") return c.fromCallsign === "K2ABC";
    if (activeTab === "received") return c.toCallsign === "K2ABC";
    return true;
  });

  const tabs = [
    { id: "my", label: "My QSLs", count: qslCards.length },
    { id: "sent", label: "Sent", count: 2 },
    { id: "received", label: "Received", count: 2 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="QSL Wallet"
        action={
          <div className="flex gap-2">
            <button className="p-2 rounded-xl hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-2 mb-4">
        <QSLStatCard label="Total" value={74} />
        <QSLStatCard label="Sent" value={22} />
        <QSLStatCard label="Received" value={32} />
        <QSLStatCard label="New" value={20} highlight />
      </div>

      <div className="flex justify-around mb-4 bg-white rounded-2xl p-3 card-shadow border border-gray-100">
        {quickActions.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-ham-purple/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-ham-purple" />
            </div>
            <span className="text-xs text-gray-600 font-medium">{label}</span>
          </button>
        ))}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-4" />

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 divide-y divide-gray-50">
        {filtered.map((card) => (
          <QSLListItem key={card.id} card={card} />
        ))}
      </div>
    </AppShell>
  );
}
