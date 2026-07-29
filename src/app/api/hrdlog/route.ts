import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CALLSIGN_RE = /^[A-Z0-9/-]{3,16}$/i;

export type HrdLogQso = {
  callsign: string;
  station: string;
  startTime: string;
  band: string;
  mode: string;
  rstRecv: string;
  rstSent: string;
  dxcc: string;
  comment: string;
};

function tagValue(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i"));
  return (match?.[1] || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function extractXml(payload: string): string {
  const quoted = payload.match(/return\s+'([\s\S]*?)'\s*;?\s*\}\s*$/);
  if (quoted?.[1]) {
    return quoted[1]
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\\\/g, "\\");
  }

  const xmlStart = payload.indexOf("<?xml");
  if (xmlStart >= 0) {
    const xmlEnd = payload.lastIndexOf("</DocumentElement>");
    if (xmlEnd > xmlStart) {
      return payload.slice(xmlStart, xmlEnd + "</DocumentElement>".length);
    }
  }

  throw new Error("Unexpected HRDLOG response format.");
}

function parseLogbooks(xml: string): HrdLogQso[] {
  const blocks = xml.match(/<Logbooks>[\s\S]*?<\/Logbooks>/gi) || [];
  return blocks.map((block) => ({
    callsign: tagValue(block, "QRZ"),
    station: tagValue(block, "Station"),
    startTime: tagValue(block, "StartTime"),
    band: tagValue(block, "BandMHz"),
    mode: tagValue(block, "Mode"),
    rstRecv: tagValue(block, "ReportRecv"),
    rstSent: tagValue(block, "ReportSent"),
    dxcc: tagValue(block, "DXCC"),
    comment: tagValue(block, "Comment"),
  }));
}

function formatStartTime(value: string): string {
  if (!value) return "—";
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,
  );
  if (!match) return value;
  return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const callsign = (searchParams.get("callsign") || "").trim().toUpperCase();
  const limitRaw = Number(searchParams.get("limit") || "10");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 10;

  if (!callsign || !CALLSIGN_RE.test(callsign)) {
    return NextResponse.json({ error: "Invalid HRDLOG callsign." }, { status: 400 });
  }

  const suffix = Date.now().toString(36);
  const url = `https://www.hrdlog.net/hrdlog.aspx?qrz=${encodeURIComponent(callsign)}&numqso=${limit}&suffix=${suffix}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: "*/*",
        "User-Agent": "QRZ-Social/1.0",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `HRDLOG request failed (${upstream.status}).` },
        { status: 502 },
      );
    }

    const payload = await upstream.text();
    const xml = extractXml(payload);
    const qsos = parseLogbooks(xml).map((qso) => ({
      ...qso,
      startTime: formatStartTime(qso.startTime),
    }));

    return NextResponse.json({
      callsign,
      qsos,
      logbookUrl: `https://www.hrdlog.net/ViewLogbook.aspx?Callsign=${encodeURIComponent(callsign)}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HRDLOG unavailable.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
