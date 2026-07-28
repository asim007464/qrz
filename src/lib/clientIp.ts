/** Best-effort client IP from common proxy / CDN headers. */
export function getClientIp(request: Request): string | null {
  const headers = request.headers;
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    headers.get("x-client-ip"),
  ];

  for (const raw of candidates) {
    const ip = raw?.trim();
    if (!ip || ip === "unknown") continue;
    return ip;
  }

  return null;
}

export function isPrivateOrLocalIp(ip: string): boolean {
  const value = ip.trim().toLowerCase();
  if (!value) return true;
  if (value === "::1" || value === "localhost") return true;
  if (value.startsWith("127.")) return true;
  if (value.startsWith("10.")) return true;
  if (value.startsWith("192.168.")) return true;
  if (value.startsWith("169.254.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) return true;
  if (value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:")) return true;
  return false;
}
