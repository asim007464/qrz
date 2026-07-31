import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialLinks as SocialLinksType } from "@/types";

const platforms = [
  { key: "website" as const, label: "Web", icon: Globe },
  { key: "facebook" as const, label: "f" },
  { key: "youtube" as const, label: "YT" },
  { key: "linkedin" as const, label: "in" },
  { key: "twitter" as const, label: "X" },
];

function toHref(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

type SocialLinkButtonsProps = {
  className?: string;
  size?: "sm" | "md";
  links?: SocialLinksType;
};

export function SocialLinkButtons({ className, size = "md", links = {} }: SocialLinkButtonsProps) {
  const dim = size === "sm" ? "w-10 h-10 text-xs" : "w-11 h-11 text-sm";

  return (
    <div className={cn("flex gap-3", className)}>
      {platforms.map(({ key, label, icon: Icon }) => {
        const url = links[key];
        const classNameBtn = cn(
          "rounded-full gradient-purple flex items-center justify-center transition-opacity font-bold text-white",
          dim,
          !url && "opacity-40 cursor-not-allowed pointer-events-none"
        );

        if (!url) {
          return (
            <span key={key} className={classNameBtn} title={`No ${key} link`} aria-disabled="true">
              {Icon ? <Icon className="w-5 h-5" /> : label}
            </span>
          );
        }

        return (
          <a
            key={key}
            href={toHref(url)}
            target="_blank"
            rel="noopener noreferrer"
            className={classNameBtn}
            title={key}
          >
            {Icon ? <Icon className="w-5 h-5" /> : label}
          </a>
        );
      })}
    </div>
  );
}

export function SocialLinkIcons({ className, links = {} }: { className?: string; links?: SocialLinksType }) {
  const entries = Object.entries(links).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className={cn("flex gap-3", className)}>
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={toHref(url!)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center hover:opacity-90 text-white text-xs font-bold uppercase"
        >
          {key.slice(0, 2)}
        </a>
      ))}
    </div>
  );
}
