type Coords = { latitude: number; longitude: number };

export function parseCoords(
  lat: unknown,
  lng: unknown
): Coords | null {
  const latitude = typeof lat === "number" ? lat : parseFloat(String(lat ?? ""));
  const longitude = typeof lng === "number" ? lng : parseFloat(String(lng ?? ""));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

/** Free Nominatim geocode — used when the browser does not supply coordinates. */
export async function geocodeLocation(
  location: string,
  country: string
): Promise<Coords | null> {
  const query = [location, country].filter(Boolean).join(", ");
  if (!query.trim()) return null;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "QRZ-Social/1.0 (ham radio social network)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const hit = data[0];
    if (!hit?.lat || !hit?.lon) return null;

    return {
      latitude: parseFloat(hit.lat),
      longitude: parseFloat(hit.lon),
    };
  } catch {
    return null;
  }
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
