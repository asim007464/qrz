"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SITE_COPY,
  mergeSiteCopy,
  siteCopyText,
  type SiteCopyMap,
} from "@/lib/siteCopy";

let cachedCopy: SiteCopyMap | null = null;
let inflight: Promise<SiteCopyMap> | null = null;

async function loadSiteCopy(): Promise<SiteCopyMap> {
  if (cachedCopy) return cachedCopy;
  if (inflight) return inflight;

  inflight = fetch("/api/site-copy")
    .then(async (res) => {
      if (!res.ok) return DEFAULT_SITE_COPY;
      const body = (await res.json()) as { copy?: SiteCopyMap };
      const merged = mergeSiteCopy(body.copy);
      cachedCopy = merged;
      return merged;
    })
    .catch(() => DEFAULT_SITE_COPY)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function invalidateSiteCopyCache() {
  cachedCopy = null;
}

export function useSiteCopy() {
  const [copy, setCopy] = useState<SiteCopyMap>(cachedCopy ?? DEFAULT_SITE_COPY);
  const [loading, setLoading] = useState(!cachedCopy);

  useEffect(() => {
    let cancelled = false;
    loadSiteCopy().then((data) => {
      if (cancelled) return;
      setCopy(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const t = useCallback((key: string) => siteCopyText(copy, key), [copy]);

  return { copy, t, loading };
}
