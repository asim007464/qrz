import type { QSLCard, QSLTemplate } from "@/types";

export type DbQslRow = {
  id: string;
  template_id?: string | null;
  from_callsign: string;
  to_callsign: string;
  from_name?: string | null;
  from_address?: string | null;
  from_country?: string | null;
  itu_zone?: string | null;
  qso_date?: string | null;
  qso_utc?: string | null;
  mhz?: string | null;
  mode?: string | null;
  rst?: string | null;
  qsl_via?: string | null;
  status: QSLCard["status"];
  background_image?: string | null;
  thumbnail?: string | null;
  created_at?: string | null;
  qsl_templates?: {
    id: string;
    name: string;
    background_color: string;
    accent_color: string;
    border_color: string;
    background_image?: string | null;
  } | null;
};

export function mapQslCard(row: DbQslRow): QSLCard {
  return {
    id: row.id,
    templateId: row.template_id || "",
    fromCallsign: row.from_callsign,
    toCallsign: row.to_callsign,
    fromName: row.from_name || "",
    fromAddress: row.from_address || "",
    fromCountry: row.from_country || "",
    ituZone: row.itu_zone || "",
    date: row.qso_date || "",
    utc: row.qso_utc || "",
    mhz: row.mhz || "",
    mode: row.mode || "",
    rst: row.rst || "",
    qslVia: row.qsl_via || "",
    status: row.status,
    backgroundImage: row.background_image || undefined,
    thumbnail: row.thumbnail || undefined,
    createdAt: row.created_at || "",
  };
}

export function mapQslTemplate(row: DbQslRow["qsl_templates"]): QSLTemplate | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    backgroundColor: row.background_color,
    accentColor: row.accent_color,
    borderColor: row.border_color,
    backgroundImage: row.background_image || undefined,
    isAdminCreated: true,
  };
}

export const DEFAULT_QSL_TEMPLATE: QSLTemplate = {
  id: "default",
  name: "Classic",
  backgroundColor: "#1E4D5C",
  accentColor: "#F5E6C8",
  borderColor: "#C9A84C",
  isAdminCreated: true,
};
