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
