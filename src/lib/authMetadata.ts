/** Keep auth JWT/cookies small — never store images in user_metadata. */
export function compactAuthMetadata(metadata: Record<string, unknown> | undefined | null) {
  const displayName = String(metadata?.display_name ?? metadata?.name ?? "").trim();
  const callsign = String(metadata?.callsign ?? "").trim().toUpperCase();
  return {
    ...(displayName ? { display_name: displayName } : {}),
    ...(callsign ? { callsign } : {}),
  };
}

export function authMetadataIsBloated(metadata: Record<string, unknown> | undefined | null): boolean {
  if (!metadata) return false;
  if (metadata.avatar_url || metadata.avatarUrl || metadata.bio_image) return true;
  try {
    return JSON.stringify(metadata).length > 512;
  } catch {
    return true;
  }
}
