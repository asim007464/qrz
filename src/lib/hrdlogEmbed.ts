const HRDLOG_CALLSIGN_RE = /^[A-Z0-9/-]{3,16}$/i;

/** Extract callsign from HRDLOG embed HTML/JS or a bare callsign. */
export function parseHrdLogCallsign(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  const fromCtor = raw.match(/new\s+HrdLog\s*\(\s*['"]([A-Za-z0-9/-]{3,16})['"]\s*\)/i);
  if (fromCtor?.[1] && HRDLOG_CALLSIGN_RE.test(fromCtor[1])) {
    return fromCtor[1].toUpperCase();
  }

  const fromDiv = raw.match(/id=["']hrdlog["'][^>]*>\s*([A-Za-z0-9/-]{3,16})\s*</i);
  if (fromDiv?.[1] && HRDLOG_CALLSIGN_RE.test(fromDiv[1]) && !/hrdlog\.net/i.test(fromDiv[1])) {
    return fromDiv[1].toUpperCase();
  }

  const bare = raw.toUpperCase();
  if (HRDLOG_CALLSIGN_RE.test(bare) && !/HRDLOG\.NET/i.test(bare)) {
    return bare;
  }

  return null;
}

export function isValidHrdLogCallsign(value: string): boolean {
  const v = value.trim().toUpperCase();
  return Boolean(v) && HRDLOG_CALLSIGN_RE.test(v) && !/HRDLOG\.NET/i.test(v);
}

export { HRDLOG_CALLSIGN_RE };
