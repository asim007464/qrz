export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return `https://${vercelProd.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

export function getAuthCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}

export function buildEmailVerificationUrl(hashedToken: string): string {
  const params = new URLSearchParams({ token_hash: hashedToken, type: "signup" });
  return `${getAuthCallbackUrl()}?${params.toString()}`;
}
