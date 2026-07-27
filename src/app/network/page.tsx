"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { NetworkUserRow } from "@/components/network/NetworkUserRow";
import { supabase } from "@/lib/supabase";
import { avatarForCallsign } from "@/lib/profileDefaults";
import type { NetworkUser } from "@/types";

type FollowRow = {
  id: string;
  status: string;
  created_at: string;
  follower?: { id: string; callsign: string; name: string; avatar_url: string | null; location?: string };
  following?: { id: string; callsign: string; name: string; avatar_url: string | null; location?: string };
};

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState("followers");
  const [rows, setRows] = useState<FollowRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setRows([]);
        setLoading(false);
        return;
      }

      const [followersRes, followingRes] = await Promise.all([
        fetch("/api/network?type=followers", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("/api/network?type=following", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      const followers = followersRes.ok ? await followersRes.json() : [];
      const following = followingRes.ok ? await followingRes.json() : [];
      setRows([...(followers || []), ...(following || [])]);
      setLoading(false);
    }
    void load();
  }, []);

  const networkUsers: NetworkUser[] = rows.map((row) => {
    const peer = row.follower || row.following;
    const callsign = peer?.callsign || "UNKNOWN";
    return {
      id: row.id,
      callsign,
      name: peer?.name || callsign,
      avatar: avatarForCallsign(callsign, peer?.avatar_url),
      title: peer?.location || "",
      location: peer?.location || "",
      connectedAt: new Date(row.created_at).toLocaleDateString(),
      status: row.status as NetworkUser["status"],
    };
  });

  const filtered = networkUsers.filter((u) => {
    if (activeTab === "followers") return u.status === "follower" || u.status === "connected";
    if (activeTab === "following") return u.status === "following";
    return u.status === "request";
  });

  const tabs = [
    {
      id: "followers",
      label: "Followers",
      count: networkUsers.filter((u) => u.status === "follower" || u.status === "connected").length,
    },
    {
      id: "following",
      label: "Following",
      count: networkUsers.filter((u) => u.status === "following").length,
    },
    {
      id: "requests",
      label: "Requests",
      count: networkUsers.filter((u) => u.status === "request").length,
    },
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
        {loading && <p className="text-center text-gray-400 py-8 text-sm">Loading network…</p>}
        {!loading &&
          filtered.map((user) => <NetworkUserRow key={user.id} user={user} />)}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No users in this tab</p>
        )}
      </div>
    </AppShell>
  );
}
