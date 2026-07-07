"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { NetworkUser } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type NetworkUserRowProps = {
  user: NetworkUser;
  showActions?: boolean;
};

export function NetworkUserRow({ user, showActions = true }: NetworkUserRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <Link href={`/profile/${user.callsign}`} className="shrink-0">
        <Image
          src={user.avatar}
          alt={user.callsign}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.callsign}`}>
          <p className="font-semibold text-gray-900 hover:text-ham-purple transition-colors">
            {user.name}
          </p>
        </Link>
        <p className="text-sm text-gray-500">{user.title}</p>
        <p className="text-xs text-gray-400">
          {user.callsign} · Added {user.connectedAt}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {user.status === "request" && showActions && (
          <>
            <Button size="sm" variant="primary">Accept</Button>
            <Button size="sm" variant="outline">Reject</Button>
          </>
        )}
        {user.status === "connected" && (
          <Badge variant="success">Connected</Badge>
        )}
        {showActions && (
          <button className="p-1.5 rounded-lg hover:bg-gray-100">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
