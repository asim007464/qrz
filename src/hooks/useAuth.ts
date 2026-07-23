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
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile(authUser: User | null) {
      if (!authUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("name, callsign, email, role, is_blocked, avatar_url, location, country, itu_zone, active_band, active_frequency, active_mode, cq_zone, grid, hrdlog_callsign")
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
              }).then(() => setProfile((p) => (p ? { ...p, role: "admin" } : p)));
            }
          });
        }
      } else {
        setProfile({
          name: authUser.user_metadata?.display_name ?? "",
          callsign: authUser.user_metadata?.callsign ?? "",
          email: authUser.email ?? "",
          role: isAdminEmail(authUser.email) ? "admin" : "member",
        });
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isSuperAdmin = isAdminEmail(user?.email) || isAdminEmail(profile?.email);
  const canAccessAdmin = isSuperAdmin || profile?.role === "admin";

  return { user, profile, loading, isLoggedIn: !!user, canAccessAdmin, isSuperAdmin };
}
