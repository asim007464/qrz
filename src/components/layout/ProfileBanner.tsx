import Image from "next/image";
import { Globe, QrCode, Radio } from "lucide-react";
import type { UserProfile } from "@/types";
import { Badge } from "@/components/ui/Badge";
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
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
          <div>
            <h2 className={cn("font-bold tracking-wide", compact ? "text-xl" : "text-2xl md:text-3xl")}>
              {user.callsign}
            </h2>
            <p className="text-white/80 text-sm">{user.name}</p>
            <div className="flex items-center gap-1 mt-1 text-white/70 text-xs md:text-sm">
              <Globe className="w-3.5 h-3.5" />
              {user.location}
            </div>
          </div>
        </div>

        {showQr && (
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="bg-white p-1.5 rounded-lg">
              <QrCode className="w-12 h-12 text-ham-purple" />
            </div>
            <span className="text-[10px] text-white/60">Scan to connect</span>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {Object.entries(user.socialLinks).slice(0, 4).map(([key]) => (
              <span
                key={key}
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs uppercase font-bold hover:bg-white/25 transition-colors cursor-pointer"
              >
                {key[0]}
              </span>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <Badge variant="default" className="bg-white/15 text-white border-0">
              {user.cardsReceived} QSLs
            </Badge>
            <Badge variant="default" className="bg-white/15 text-white border-0">
              {user.profileViews} views
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
