/** App pages guests can browse without signing in. */
export const GUEST_ACCESSIBLE_PATHS = [
  "/",
  "/download",
  "/download/android-apk",
  "/download/ios-ipa",
  "/manifest.webmanifest",
  "/sw.js",
] as const;

/** Static assets that must stay public for PWA / APK packaging. */
export const GUEST_ACCESSIBLE_PREFIXES = ["/downloads/"] as const;

/** Routes reachable without a session (auth flows + APIs). */
export const AUTH_PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

export const AUTH_PUBLIC_PREFIXES = ["/auth/"] as const;

export const LOCKDOWN_BYPASS_PREFIXES = [
  "/maintenance",
  "/admin",
  ...AUTH_PUBLIC_PATHS,
  ...AUTH_PUBLIC_PREFIXES,
  "/api/",
] as const;

export function isGuestAccessiblePath(pathname: string): boolean {
  if (GUEST_ACCESSIBLE_PATHS.some((p) => pathname === p)) return true;
  return GUEST_ACCESSIBLE_PREFIXES.some((p) => pathname.startsWith(p));
}

export function isAuthPublicPath(pathname: string): boolean {
  if (AUTH_PUBLIC_PATHS.some((p) => pathname === p)) return true;
  return AUTH_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function isLockdownBypass(pathname: string): boolean {
  return LOCKDOWN_BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}
