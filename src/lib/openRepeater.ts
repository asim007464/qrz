import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
  dcs?: number | null;
  image_url?: string | null;
};

export const OPENREPEATER_SITE =
  process.env.OPENREPEATER_SITE?.replace(/\/$/, "") || "https://www.openrepeater.org";

export const OPENREPEATER_API_BASE =
  process.env.OPENREPEATER_API_BASE_URL?.replace(/\/$/, "") || `${OPENREPEATER_SITE}/api/v1`;

const REPEATER_SELECT =
  "id, callsign, output_freq, freq_offset, band, mode, country, city, ctcss, dcs, coverage, owner, website, lat, lng, status, image_url, review_status, is_public, created_at, updated_at";

type DbRow = {
  id: string;
  callsign: string;
  output_freq: string;
  freq_offset: string | null;
  band: string;
  mode: string;
  country: string;
  city: string;
  ctcss: string | null;
  dcs: string | null;
  coverage: string | null;
  owner: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  image_url: string | null;
  review_status?: string | null;
  is_public?: boolean | null;
};

function parseNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseCoverageKm(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = String(value).match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function isPublic(row: DbRow): boolean {
  const status = (row.review_status ?? "pending").toLowerCase();
  if (status === "rejected") return false;
  if (status === "approved") return true;
  return row.is_public === true;
}

function mapDbRow(row: DbRow): OpenRepeaterItem {
  return {
    id: row.id,
    callsign: row.callsign,
    frequency: parseNumber(row.output_freq),
    offset: parseNumber(row.freq_offset),
    mode: row.mode,
    band: row.band,
    country: row.country,
    city: row.city,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    coverage_km: parseCoverageKm(row.coverage),
    owner: row.owner,
    website: row.website,
    status: row.status === "inactive" ? "inactive" : "active",
    ctcss: parseNumber(row.ctcss),
    dcs: parseNumber(row.dcs),
    image_url: row.image_url,
  };
}

function mapApiRepeater(raw: Record<string, unknown>): OpenRepeaterItem {
  return {
    id: String(raw.id ?? raw.callsign ?? ""),
    callsign: String(raw.callsign ?? ""),
    frequency: typeof raw.frequency === "number" ? raw.frequency : parseNumber(String(raw.frequency ?? raw.output_freq ?? "")),
    offset: typeof raw.offset === "number" ? raw.offset : parseNumber(String(raw.offset ?? raw.freq_offset ?? "")),
    mode: String(raw.mode ?? ""),
    band: String(raw.band ?? ""),
    country: String(raw.country ?? ""),
    city: String(raw.city ?? ""),
    lat: typeof raw.lat === "number" ? raw.lat : null,
    lng: typeof raw.lng === "number" ? raw.lng : null,
    coverage_km: typeof raw.coverage_km === "number" ? raw.coverage_km : parseCoverageKm(String(raw.coverage ?? "")),
    owner: raw.owner ? String(raw.owner) : null,
    website: raw.website ? String(raw.website) : null,
    status: String(raw.status ?? "active"),
    ctcss: typeof raw.ctcss === "number" ? raw.ctcss : parseNumber(String(raw.ctcss ?? "")),
    dcs: typeof raw.dcs === "number" ? raw.dcs : parseNumber(String(raw.dcs ?? "")),
    image_url: raw.image_url ? String(raw.image_url) : null,
  };
}

function applyFilters(list: OpenRepeaterItem[], params: {
  country?: string;
  band?: string;
  mode?: string;
  q?: string;
}): OpenRepeaterItem[] {
  let result = list;

  if (params.country) {
    const c = params.country.toLowerCase();
    result = result.filter((r) => r.country.toLowerCase().includes(c));
  }
  if (params.band) {
    const b = params.band.toLowerCase();
    result = result.filter((r) => r.band.toLowerCase().startsWith(b));
  }
  if (params.mode) {
    const m = params.mode.toLowerCase();
    result = result.filter((r) => r.mode.toLowerCase().includes(m));
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter(
      (r) =>
        r.callsign.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        String(r.frequency ?? "").includes(q)
    );
  }

  return result;
}

function paginate(list: OpenRepeaterItem[], page: number, limit: number) {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const safePage = Math.max(page, 1);
  const start = (safePage - 1) * safeLimit;
  return {
    repeaters: list.slice(start, start + safeLimit),
    total: list.length,
  };
}

function openRepeaterAdmin(): SupabaseClient | null {
  const url = process.env.OPENREPEATER_SUPABASE_URL?.trim();
  const key = process.env.OPENREPEATER_SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function fetchFromOpenRepeaterDb(): Promise<OpenRepeaterItem[] | null> {
  const db = openRepeaterAdmin();
  if (!db) return null;

  const { data, error } = await db
    .from("repeaters")
    .select(REPEATER_SELECT)
    .neq("review_status", "rejected")
    .order("created_at", { ascending: false });

  if (error || !data) return null;
  return (data as DbRow[]).filter(isPublic).map(mapDbRow);
}

async function fetchFromOpenRepeaterDownloads(): Promise<OpenRepeaterItem[] | null> {
  const url = `${OPENREPEATER_SITE}/api/downloads?format=json`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;

  const data = await res.json();
  const list = (data.repeaters ?? []).map((r: Record<string, unknown>) => mapApiRepeater(r));
  return list.length > 0 || (data.count ?? 0) === 0 ? list : null;
}

async function fetchFromOpenRepeaterApi(params: {
  country?: string;
  band?: string;
  mode?: string;
  page?: number;
  limit?: number;
}): Promise<{ repeaters: OpenRepeaterItem[]; total: number } | null> {
  const apiKey = process.env.OPENREPEATER_API_KEY?.trim();
  if (!apiKey) return null;

  const url = new URL(`${OPENREPEATER_API_BASE}/repeaters`);
  if (params.country) url.searchParams.set("country", params.country);
  if (params.band) url.searchParams.set("band", params.band);
  if (params.mode) url.searchParams.set("mode", params.mode);
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("limit", String(params.limit ?? 200));

  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": apiKey },
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const repeaters = (data.repeaters ?? []).map((r: Record<string, unknown>) => mapApiRepeater(r));
  return { repeaters, total: data.total ?? repeaters.length };
}

export function openRepeaterDetailUrl(callsign: string): string {
  return `${OPENREPEATER_SITE}/repeater/${encodeURIComponent(callsign.trim().toLowerCase())}`;
}

export async function fetchOpenRepeaterList(params: {
  country?: string;
  band?: string;
  mode?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ repeaters: OpenRepeaterItem[]; total: number; source: string }> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;

  const dbList = await fetchFromOpenRepeaterDb();
  if (dbList) {
    const filtered = applyFilters(dbList, params);
    const { repeaters, total } = paginate(filtered, page, limit);
    return { repeaters, total, source: "openrepeater-database" };
  }

  const apiResult = await fetchFromOpenRepeaterApi({ ...params, limit: 200 });
  if (apiResult) {
    let list = apiResult.repeaters;
    if (params.q) list = applyFilters(list, { q: params.q });
    const { repeaters, total } = paginate(list, page, limit);
    return { repeaters, total, source: "openrepeater-api" };
  }

  const downloads = await fetchFromOpenRepeaterDownloads();
  if (downloads) {
    const filtered = applyFilters(downloads, params);
    const { repeaters, total } = paginate(filtered, page, limit);
    return { repeaters, total, source: "openrepeater-downloads" };
  }

  return { repeaters: [], total: 0, source: "unavailable" };
}
