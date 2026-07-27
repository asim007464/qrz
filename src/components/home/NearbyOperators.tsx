"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { MapOperator } from "@/app/api/operators/route";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const OperatorsMap = dynamic(
  () => import("./OperatorsMap").then((m) => m.OperatorsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 rounded-xl border border-gray-100 bg-gray-50 animate-pulse" />
    ),
  }
);

type NearbyOperatorsProps = {
  excludeId?: string;
  userLat?: number | null;
  userLng?: number | null;
};

export function NearbyOperators({ excludeId, userLat, userLng }: NearbyOperatorsProps) {
  const [operators, setOperators] = useState<MapOperator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ limit: "8" });
    if (excludeId) params.set("exclude", excludeId);
    if (userLat != null && userLng != null) {
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
    }

    fetch(`/api/operators?${params}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: MapOperator[]) => {
        if (!cancelled) setOperators(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [excludeId, userLat, userLng]);

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ham-purple tracking-wide">
            Operators map
          </h2>
          <Link href="/search" className="text-xs text-ham-purple hover:underline">
            See All
          </Link>
        </div>

        {loading ? (
          <div className="h-44 rounded-xl bg-gray-50 animate-pulse mb-4" />
        ) : (
          <OperatorsMap operators={operators} className="h-44 sm:h-52 mb-4" />
        )}

        <div className="space-y-2">
          {operators.slice(0, 4).map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.callsign}`}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50"
            >
              <Image
                src={u.avatar}
                alt={u.callsign}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ham-purple truncate">
                    {u.callsign}
                  </span>
                  {u.onAir ? (
                    <Badge variant="success" className="text-[10px] px-2 py-0.5">
                      ON AIR
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-gray-100">
                      Idle
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{u.location}</p>
                {u.distanceKm != null && (
                  <p className="text-[10px] text-gray-400">
                    {u.distanceKm.toFixed(1)} km away
                  </p>
                )}
              </div>
            </Link>
          ))}

          {!loading && operators.length === 0 && (
            <p className="text-sm text-center text-gray-400 py-6">
              No operators on the map yet
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
