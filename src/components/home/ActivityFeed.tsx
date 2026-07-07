"use client";

import Image from "next/image";
import Link from "next/link";
import type { ActivityItem } from "@/types";

type ActivityFeedProps = {
  activities: ActivityItem[];
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-white rounded-2xl p-4 card-shadow border border-gray-100">
          <div className="flex items-start gap-3">
            <Link href={`/profile/${activity.user.callsign}`}>
              <Image
                src={activity.user.avatar}
                alt={activity.user.callsign}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${activity.user.callsign}`}
                  className="font-semibold text-ham-purple hover:underline"
                >
                  {activity.user.callsign}
                </Link>
                <span className="text-xs text-gray-400">{activity.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{activity.content}</p>
              {activity.image && (
                <div className="mt-3 rounded-xl overflow-hidden">
                  <Image
                    src={activity.image}
                    alt="Post"
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
