"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { LockdownSettings } from "@/lib/siteSettings";

export interface AdminUser {
  id: string;
  name: string;
  callsign: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

export interface AdminSupport {
  id: string;
  user_name: string;
  callsign: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  reply: string;
  ai_suggested_reply?: string;
  created_at: string;
}

export interface AdminTemplate {
  id: string;
  name: string;
  background_color: string;
  accent_color: string;
  border_color: string;
  background_image?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminData {
  online: { name: string; callsign: string; page: string; last_seen: string; profiles?: { name: string; callsign: string } }[];
  support: AdminSupport[];
  users: AdminUser[];
  templates: AdminTemplate[];
  lockdown: LockdownSettings & { message?: string };
  stats: {
    totalUsers: number;
    openSupport: number;
    totalTemplates: number;
    onlineNow: number;
  };
  session: { isSuperAdmin: boolean; name: string; email: string };
}

export function useAdminData() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setError("Failed to load admin data");
      setLoading(false);
      return;
    }

    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      ...options.headers,
    },
  });
}
