const DEFAULT_SUPER_ADMIN_EMAILS = ["qrzinfo@gmail.com", "ehamhub@gmail.com"] as const;

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function getSuperAdminEmails(): string[] {
  const fromList = parseEmailList(process.env.ADMIN_EMAILS);
  const fromSingle = parseEmailList(process.env.ADMIN_EMAIL);
  return Array.from(new Set([...fromList, ...fromSingle, ...DEFAULT_SUPER_ADMIN_EMAILS]));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.trim().toLowerCase());
}

export function resolveUserRole(email: string): "admin" | "member" {
  return isAdminEmail(email) ? "admin" : "member";
}
