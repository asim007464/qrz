import { HrdLogWidget } from "@/components/profile/HrdLogWidget";

type HomeHrdLogBoxProps = {
  hrdlogCallsign?: string | null;
};

export function HomeHrdLogBox({ hrdlogCallsign }: HomeHrdLogBoxProps) {
  const resolvedCallsign = (hrdlogCallsign || "").trim().toUpperCase();

  return <HrdLogWidget callsign={resolvedCallsign} lastQsoCount={10} className="mb-4" />;
}
