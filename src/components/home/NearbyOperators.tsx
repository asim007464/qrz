"use client";

import Image from "next/image";
import Link from "next/link";
import type { NetworkUser } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type NearbyOperatorsProps = {
  operators: NetworkUser[];
};

function PresenceBadge({ status }: { status: NetworkUser["status"] }) {
  if (status === "connected") {
    return (
      <Badge variant="success" className="text-[10px] px-2 py-0.5">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-gray-100">
      Idle
    </Badge>
  );
}

export function NearbyOperators({ operators }: NearbyOperatorsProps) {
  return (
    <Card padding={false} className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ham-purple tracking-wide">
            Nearby operators
          </h2>
          <Link href="/network" className="text-xs text-ham-purple hover:underline">
            See All
          </Link>
        </div>

        <div
          className="h-40 sm:h-44 rounded-xl border border-gray-100 overflow-hidden mb-4"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.0) 45%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.0) 48%), linear-gradient(180deg, rgba(17,24,39,0.06), rgba(17,24,39,0.02))",
          }}
          aria-hidden
        >
          <div className="p-3 text-[10px] text-gray-500">
            Map preview (mock)
          </div>
        </div>

        <div className="space-y-2">
          {operators.map((u) => (
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
                  <PresenceBadge status={u.status} />
                </div>
                <p className="text-xs text-gray-500 truncate">{u.location}</p>
                <p className="text-[10px] text-gray-400">
                  {(u.distanceKm ?? 0).toFixed(1)} km · Added {u.connectedAt}
                </p>
              </div>
            </Link>
          ))}

          {operators.length === 0 && (
            <p className="text-sm text-center text-gray-400 py-6">
              No nearby operators
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

