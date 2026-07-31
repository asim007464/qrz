const HRDLOG_CALLSIGN_RE = /^[A-Z0-9/-]{3,16}$/i;

function looksLikeCallsign(value: string): boolean {
  return HRDLOG_CALLSIGN_RE.test(value) && !/HRDLOG\.NET/i.test(value);
}

/** Extract callsign from embed HTML/JS, a public log URL, or a bare callsign. */
export function parseHrdLogCallsign(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  const fromCtor = raw.match(/new\s+HrdLog\s*\(\s*['"]([A-Za-z0-9/-]{3,16})['"]\s*\)/i);
  if (fromCtor?.[1] && looksLikeCallsign(fromCtor[1])) {
    return fromCtor[1].toUpperCase();
  }

  const fromDiv = raw.match(/id=["']hrdlog["'][^>]*>\s*([A-Za-z0-9/-]{3,16})\s*</i);
  if (fromDiv?.[1] && looksLikeCallsign(fromDiv[1])) {
    return fromDiv[1].toUpperCase();
  }

  const fromQuery = raw.match(/[?&#](?:callsign|qrz)=([A-Za-z0-9/-]{3,16})/i);
  if (fromQuery?.[1] && looksLikeCallsign(fromQuery[1])) {
    return fromQuery[1].toUpperCase();
  }

  const fromPath = raw.match(
    /(?:hrdlog\.net|clublog\.org|eqsl\.cc|lotw\.arrl\.org)[^A-Za-z0-9/-]*([A-Za-z0-9/-]{3,16})/i,
  );
  if (fromPath?.[1] && looksLikeCallsign(fromPath[1]) && !/www|net|org|cc|arrl|view|logbook/i.test(fromPath[1])) {
    return fromPath[1].toUpperCase();
  }

  const bare = raw.toUpperCase();
  if (looksLikeCallsign(bare)) {
    return bare;
  }

  return null;
}

export function isValidHrdLogCallsign(value: string): boolean {
  const v = value.trim().toUpperCase();
  return Boolean(v) && looksLikeCallsign(v);
}

export { HRDLOG_CALLSIGN_RE };
