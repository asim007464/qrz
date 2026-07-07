"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { NetworkUserRow } from "@/components/network/NetworkUserRow";
import { networkUsers } from "@/lib/mock-data";

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState("followers");

  const filtered = networkUsers.filter((u) => {
    if (activeTab === "followers") return u.status === "follower" || u.status === "connected";
    if (activeTab === "following") return u.status === "following";
    return u.status === "request";
  });

  const tabs = [
    { id: "followers", label: "Followers", count: 2 },
    { id: "following", label: "Following", count: 1 },
    { id: "requests", label: "Requests", count: 1 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="My Network"
        backHref="/menu"
        action={
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <UserPlus className="w-5 h-5 text-ham-purple" />
          </button>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-4" />

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 divide-y divide-gray-50">
        {filtered.map((user) => (
          <NetworkUserRow key={user.id} user={user} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No users in this tab</p>
        )}
      </div>
    </AppShell>
  );
}
