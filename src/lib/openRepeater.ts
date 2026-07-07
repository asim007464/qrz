export type OpenRepeaterItem = {
  id: string;
  callsign: string;
  frequency: number | null;
  offset: number | null;
  mode: string;
  band: string;
  country: string;
  city: string;
  lat: number | null;
  lng: number | null;
  coverage_km: number | null;
  owner: string | null;
  website: string | null;
  status: string;
  ctcss?: number | null;
  image_url?: string | null;
};

export const OPENREPEATER_SITE = "https://www.openrepeater.org";
export const OPENREPEATER_API_BASE =
  process.env.OPENREPEATER_API_BASE_URL?.replace(/\/$/, "") || `${OPENREPEATER_SITE}/api/v1`;

function mapRawRepeater(raw: Record<string, unknown>): OpenRepeaterItem {
  return {
    id: String(raw.id ?? ""),
    callsign: String(raw.callsign ?? ""),
    frequency: typeof raw.frequency === "number" ? raw.frequency : parseFloat(String(raw.output_freq ?? raw.frequency ?? "")) || null,
    offset: typeof raw.offset === "number" ? raw.offset : parseFloat(String(raw.freq_offset ?? raw.offset ?? "")) || null,
    mode: String(raw.mode ?? ""),
    band: String(raw.band ?? ""),
    country: String(raw.country ?? ""),
    city: String(raw.city ?? ""),
    lat: typeof raw.lat === "number" ? raw.lat : null,
    lng: typeof raw.lng === "number" ? raw.lng : null,
    coverage_km: typeof raw.coverage_km === "number" ? raw.coverage_km : null,
    owner: raw.owner ? String(raw.owner) : null,
    website: raw.website ? String(raw.website) : null,
    status: String(raw.status ?? "active"),
    ctcss: typeof raw.ctcss === "number" ? raw.ctcss : null,
    image_url: raw.image_url ? String(raw.image_url) : null,
  };
}

export async function fetchOpenRepeaterList(params: {
  country?: string;
  band?: string;
  mode?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ repeaters: OpenRepeaterItem[]; total: number; source: string }> {
  const apiKey = process.env.OPENREPEATER_API_KEY?.trim();

  if (apiKey) {
    const url = new URL(`${OPENREPEATER_API_BASE}/repeaters`);
    if (params.country) url.searchParams.set("country", params.country);
    if (params.band) url.searchParams.set("band", params.band);
    if (params.mode) url.searchParams.set("mode", params.mode);
    url.searchParams.set("page", String(params.page ?? 1));
    url.searchParams.set("limit", String(params.limit ?? 50));

    const res = await fetch(url.toString(), {
      headers: { "X-API-Key": apiKey },
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      const list = (data.repeaters ?? []).map((r: Record<string, unknown>) => mapRawRepeater(r));
      let filtered = list;
      if (params.q) {
        const q = params.q.toLowerCase();
        filtered = list.filter(
          (r: OpenRepeaterItem) =>
            r.callsign.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q) ||
            r.country.toLowerCase().includes(q)
        );
      }
      return { repeaters: filtered, total: data.total ?? filtered.length, source: "openrepeater-api" };
    }
  }

  // Public bulk JSON — no API key required
  const dlUrl = `${OPENREPEATER_SITE}/api/downloads?format=json`;
  const dlRes = await fetch(dlUrl, { next: { revalidate: 600 } });
  if (!dlRes.ok) {
    return { repeaters: [], total: 0, source: "unavailable" };
  }

  const dl = await dlRes.json();
  let list: OpenRepeaterItem[] = (dl.repeaters ?? []).map((r: Record<string, unknown>) => mapRawRepeater(r));

  if (params.country) {
    const c = params.country.toLowerCase();
    list = list.filter((r) => r.country.toLowerCase().includes(c));
  }
  if (params.band) {
    const b = params.band.toLowerCase();
    list = list.filter((r) => r.band.toLowerCase() === b);
  }
  if (params.mode) {
    const m = params.mode.toLowerCase();
    list = list.filter((r) => r.mode.toLowerCase() === m);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (r) =>
        r.callsign.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q)
    );
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const start = (page - 1) * limit;
  const paged = list.slice(start, start + limit);

  return { repeaters: paged, total: list.length, source: "openrepeater-downloads" };
}
