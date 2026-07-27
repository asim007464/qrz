"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";

export interface UserProfile {
  name: string;
  callsign: string;
  email: string;
  role: string;
  is_blocked?: boolean;
  avatar_url?: string | null;
  location?: string | null;
  country?: string | null;
  itu_zone?: string | null;
  active_band?: string | null;
  active_frequency?: string | null;
  active_mode?: string | null;
  cq_zone?: string | null;
  grid?: string | null;
  hrdlog_callsign?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverCanAccessAdmin, setServerCanAccessAdmin] = useState<boolean | null>(null);

  async function refreshAdminAccess(accessToken: string | undefined) {
    if (!accessToken) {
      setServerCanAccessAdmin(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/access", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        setServerCanAccessAdmin(false);
        return;
      }
      const body = (await res.json()) as { canAccessAdmin?: boolean };
      setServerCanAccessAdmin(!!body.canAccessAdmin);
    } catch {
      setServerCanAccessAdmin(false);
    }
  }

  useEffect(() => {
    async function loadProfile(authUser: User | null) {
      if (!authUser) {
        setProfile(null);
        setServerCanAccessAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("name, callsign, email, role, is_blocked, avatar_url, location, country, itu_zone, active_band, active_frequency, active_mode, cq_zone, grid, hrdlog_callsign, latitude, longitude")
        .eq("id", authUser.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        if (!isAdminEmail(authUser.email) && data.is_blocked) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          return;
        }
        if (isAdminEmail(authUser.email) && data.role !== "admin") {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
              fetch("/api/admin/sync-role", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
              }).then(() => {
                setProfile((p) => (p ? { ...p, role: "admin" } : p));
                void refreshAdminAccess(session.access_token);
              });
            }
          });
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session?.access_token) return;
          void refreshAdminAccess(session.access_token);
          fetch("/api/auth/sanitize-session", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((body) => {
              if (body?.cleaned) void supabase.auth.refreshSession();
            })
            .catch(() => null);
        });
      } else {
        setProfile({
          name: authUser.user_metadata?.display_name ?? "",
          callsign: authUser.user_metadata?.callsign ?? "",
          email: authUser.email ?? "",
          role: isAdminEmail(authUser.email) ? "admin" : "member",
        });
        supabase.auth.getSession().then(({ data: { session } }) => {
          void refreshAdminAccess(session?.access_token);
        });
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      void refreshAdminAccess(session?.access_token);
      loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void refreshAdminAccess(session?.access_token);
      loadProfile(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isSuperAdmin = isAdminEmail(user?.email) || isAdminEmail(profile?.email);
  const clientCanAccessAdmin = isSuperAdmin || profile?.role === "admin";
  const canAccessAdmin = serverCanAccessAdmin ?? clientCanAccessAdmin;

  return { user, profile, loading, isLoggedIn: !!user, canAccessAdmin, isSuperAdmin };
}
