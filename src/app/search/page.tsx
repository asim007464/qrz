"use client";

import { useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, MapPin, Eye, Radio } from "lucide-react";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { users } from "@/lib/mock-data";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered = users.filter(
    (u) =>
      u.callsign.toLowerCase().includes(query.toLowerCase()) ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.location.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader title="Search Users" backHref="/" />

      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by callsign, name, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.callsign}`}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl card-shadow border border-gray-100 hover:border-ham-accent/30 transition-colors"
          >
            <Image
              src={user.avatar}
              alt={user.callsign}
              width={52}
              height={52}
              className="w-13 h-13 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ham-purple">{user.callsign}</span>
                {user.onAir && (
                  <Badge variant="success" className="text-[10px]">
                    <Radio className="w-3 h-3 mr-0.5" />
                    ON AIR
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{user.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <MapPin className="w-3 h-3" />
                {user.location}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Eye className="w-3.5 h-3.5" />
                {user.profileViews}
              </div>
              <p className="text-xs text-gray-400 mt-1">{user.cardsReceived} QSLs</p>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">No users found</p>
        )}
      </div>
    </AppShell>
  );
}
