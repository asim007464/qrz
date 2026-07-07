export function getSafeRedirectPath(
  next: string | null | undefined,
  fallback = "/"
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
