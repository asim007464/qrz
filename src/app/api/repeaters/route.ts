import { NextResponse } from "next/server";
import { fetchOpenRepeaterList } from "@/lib/openRepeater";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const result = await fetchOpenRepeaterList({
      country: searchParams.get("country") ?? undefined,
      band: searchParams.get("band") ?? undefined,
      mode: searchParams.get("mode") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "50"),
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Repeaters fetch error:", err);
    return NextResponse.json({ error: "Could not load repeaters.", repeaters: [], total: 0 }, { status: 500 });
  }
}
