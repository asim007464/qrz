import { NextResponse } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
  extraKey = ""
): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${scope}:${ip}:${extraKey}`;
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (entry.count >= limit) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  entry.count += 1;
  return null;
}
