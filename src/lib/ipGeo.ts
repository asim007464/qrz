import { getClientIp, isPrivateOrLocalIp } from "@/lib/clientIp";

export type IpGeoResult = {
  ip: string;
  location: string | null;
};

/** Resolve approximate city/region/country for a public IP (best effort). */
export async function lookupIpLocation(ip: string): Promise<string | null> {
  if (!ip || isPrivateOrLocalIp(ip)) return null;

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      success?: boolean;
      city?: string;
      region?: string;
      country?: string;
    };
    if (data.success === false) return null;

    const parts = [data.city, data.region, data.country].filter(
      (part): part is string => Boolean(part && String(part).trim())
    );
    return parts.length ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

export async function resolveRequestIpGeo(request: Request): Promise<IpGeoResult | null> {
  const ip = getClientIp(request);
  if (!ip) return null;
  const location = await lookupIpLocation(ip);
  return { ip, location };
}
