import { HrdLogWidget } from "@/components/profile/HrdLogWidget";

const HRDLOG_CALLSIGN_RE = /^[A-Z0-9/-]{3,16}$/i;

type HomeHrdLogBoxProps = {
  hrdlogCallsign?: string | null;
};

export function HomeHrdLogBox({ hrdlogCallsign }: HomeHrdLogBoxProps) {
  const resolvedCallsign = (hrdlogCallsign || "").trim().toUpperCase();
  // Skip empty values and bad saves like "WWW.HRDLOG.NET"
  if (!resolvedCallsign || !HRDLOG_CALLSIGN_RE.test(resolvedCallsign)) return null;

  return <HrdLogWidget callsign={resolvedCallsign} lastQsoCount={10} className="mb-4" />;
}
