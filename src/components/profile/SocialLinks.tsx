import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialLinks as SocialLinksType } from "@/types";

const platformUrls: Record<string, (url: string) => string> = {
  website: (u) => u,
  facebook: (u) => u,
  youtube: (u) => u,
  linkedin: (u) => u,
  twitter: (u) => u,
  instagram: (u) => u,
};

const platforms = [
  { key: "website" as const, label: "Web", icon: Globe },
  { key: "facebook" as const, label: "f" },
  { key: "youtube" as const, label: "YT" },
  { key: "linkedin" as const, label: "in" },
  { key: "twitter" as const, label: "X" },
];

type SocialLinkButtonsProps = {
  className?: string;
  size?: "sm" | "md";
  links?: SocialLinksType;
};

export function SocialLinkButtons({ className, size = "md", links = {} }: SocialLinkButtonsProps) {
  const dim = size === "sm" ? "w-10 h-10 text-xs" : "w-11 h-11 text-sm";

  const open = (key: string) => {
    const url = links[key as keyof SocialLinksType];
    if (!url) return;
    const href = url.startsWith("http") ? url : `https://${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("flex gap-3", className)}>
      {platforms.map(({ key, label, icon: Icon }) => {
        const hasLink = Boolean(links[key]);
        return (
          <button
            key={key}
            type="button"
            disabled={!hasLink}
            onClick={() => open(key)}
            className={cn(
              "rounded-full gradient-purple flex items-center justify-center transition-opacity font-bold text-white",
              dim,
              !hasLink && "opacity-40 cursor-not-allowed"
            )}
            title={hasLink ? key : `No ${key} link`}
          >
            {Icon ? <Icon className="w-5 h-5" /> : label}
          </button>
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
          href={url!.startsWith("http") ? url! : `https://${url}`}
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
