import Image from "next/image";
import { Globe, Radio } from "lucide-react";
import type { UserProfile } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ProfileQRCode } from "@/components/profile/ProfileQRCode";
import { HrdLogWidget } from "@/components/profile/HrdLogWidget";
import { cn } from "@/lib/utils";

type ProfileBannerProps = {
  user: UserProfile;
  showQr?: boolean;
  compact?: boolean;
  className?: string;
};

export function ProfileBanner({
  user,
  showQr = true,
  compact = false,
  className,
}: ProfileBannerProps) {
  const bgStyle = user.backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(46,26,71,0.85), rgba(46,26,71,0.75)), url(${user.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const logCallsign = (user.hrdlogCallsign || "").trim();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl text-white",
        !user.backgroundImage && "gradient-purple",
        compact ? "p-4" : "p-5 md:p-6",
        className
      )}
      style={bgStyle}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 w-full sm:w-auto">
          <div className="relative">
            <Image
              src={user.avatar}
              alt={user.callsign}
              width={compact ? 56 : 72}
              height={compact ? 56 : 72}
              className={cn(
                "rounded-full border-4 border-white/30 object-cover",
                compact ? "w-14 h-14" : "w-16 h-16 md:w-[72px] md:h-[72px]"
              )}
            />
            {user.onAir && (
              <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold">
                <Radio className="w-2.5 h-2.5" />
                ON AIR
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className={cn(
                "font-bold tracking-wide truncate",
                compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl md:text-3xl"
              )}
            >
              {user.callsign}
            </h2>
            <p className="text-white/80 text-sm truncate">{user.name}</p>
            <div className="flex items-center gap-1 mt-1 text-white/70 text-xs md:text-sm min-w-0">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.location}</span>
            </div>
          </div>
        </div>

        {showQr && (
          <div className="flex flex-col items-center gap-0.5 shrink-0 self-start sm:self-auto ml-auto sm:ml-0">
            <ProfileQRCode callsign={user.callsign} size={72} />
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-white/70">Band</p>
              <p className="text-sm font-bold">{user.activeBand || "20m"}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-white/70">Frequency</p>
              <p className="text-sm font-bold">{user.activeFrequency || "14.240 MHz"}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-white/70">Mode</p>
              <p className="text-sm font-bold">{user.activeMode || "USB"}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-white/70">CQ Zone</p>
              <p className="text-sm font-bold">{user.cqZone || "CQ Zone 22"}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-white/70">ITU Zone</p>
              <p className="text-sm font-bold">{user.ituZone}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-white/70">Grid</p>
              <p className="text-sm font-bold">{user.grid || "—"}</p>
            </div>
          </div>

          {logCallsign && <HrdLogWidget callsign={logCallsign} className="mt-4" />}

          <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {Object.entries(user.socialLinks)
                .slice(0, 4)
                .map(([key]) => (
                  <span
                    key={key}
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs uppercase font-bold hover:bg-white/25 transition-colors cursor-pointer"
                    title={key}
                  >
                    {key[0]}
                  </span>
                ))}
            </div>
            <div className="flex gap-2 sm:ml-auto flex-wrap">
              <Badge variant="default" className="bg-white/15 text-white border-0">
                {user.cardsReceived} QSLs
              </Badge>
              <Badge variant="default" className="bg-white/15 text-white border-0">
                {user.profileViews} views
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
