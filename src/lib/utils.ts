type ClassValue = string | boolean | undefined | null | Record<string, boolean>;

export function fmtUTC(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    dateStyle: "short",
    timeStyle: "short",
  })} UTC`;
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
