import { Globe, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
  { key: "website", label: "Web", icon: Globe },
  { key: "facebook", label: "f", icon: null },
  { key: "youtube", label: "YT", icon: null },
  { key: "linkedin", label: "in", icon: null },
  { key: "twitter", label: "X", icon: null },
] as const;

type SocialLinkButtonsProps = {
  className?: string;
  size?: "sm" | "md";
};

export function SocialLinkButtons({ className, size = "md" }: SocialLinkButtonsProps) {
  const dim = size === "sm" ? "w-10 h-10 text-xs" : "w-11 h-11 text-sm";

  return (
    <div className={cn("flex gap-3", className)}>
      {platforms.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          className={cn(
            "rounded-full gradient-purple flex items-center justify-center hover:opacity-90 transition-opacity font-bold text-white",
            dim
          )}
          title={key}
        >
          {Icon ? <Icon className="w-5 h-5" /> : label}
        </button>
      ))}
    </div>
  );
}

export function SocialLinkIcons({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      {[Globe, Link2, Share2].map((Icon, i) => (
        <button
          key={i}
          type="button"
          className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center hover:opacity-90"
        >
          <Icon className="w-4 h-4 text-white" />
        </button>
      ))}
    </div>
  );
}
