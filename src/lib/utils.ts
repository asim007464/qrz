type ClassValue = string | boolean | undefined | null | Record<string, boolean>;

export function fmtUTC(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    dateStyle: "short",
    timeStyle: "short",
  })} UTC`;
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function cn(...classes: ClassValue[]) {
  return classes
    .flatMap((cls) => {
      if (!cls) return [];
      if (typeof cls === "string") return [cls];
      return Object.entries(cls)
        .filter(([, v]) => v)
        .map(([k]) => k);
    })
    .join(" ");
}
