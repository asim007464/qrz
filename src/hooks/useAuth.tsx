"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  canAccessAdmin: boolean;
  isSuperAdmin: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Run sanitize at most once per browser tab session. */
let sanitizeAttempted = false;

async function refreshAdminAccess(
  accessToken: string | undefined,
  setServerCanAccessAdmin: (v: boolean) => void,
) {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverCanAccessAdmin, setServerCanAccessAdmin] = useState<boolean | null>(null);
  const syncRoleAttempted = useRef(false);

  const loadProfile = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setProfile(null);
      setServerCanAccessAdmin(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select(
        "name, callsign, email, role, is_blocked, avatar_url, location, country, itu_zone, active_band, active_frequency, active_mode, cq_zone, grid, hrdlog_callsign, latitude, longitude",
      )
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

      if (
        isAdminEmail(authUser.email) &&
        data.role !== "admin" &&
        !syncRoleAttempted.current
      ) {
        syncRoleAttempted.current = true;
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/admin/sync-role", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          }).catch(() => null);
          setProfile((p) => (p ? { ...p, role: "admin" } : p));
          await refreshAdminAccess(session.access_token, setServerCanAccessAdmin);
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await refreshAdminAccess(session.access_token, setServerCanAccessAdmin);

      if (!sanitizeAttempted) {
        sanitizeAttempted = true;
        try {
          const res = await fetch("/api/auth/sanitize-session", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const body = res.ok ? await res.json() : null;
          // Refresh once if metadata was cleaned — do not re-enter profile load loop.
          if (body?.cleaned) {
            await supabase.auth.refreshSession();
          }
        } catch {
          // ignore
        }
      }
    } else {
      setProfile({
        name: authUser.user_metadata?.display_name ?? "",
        callsign: authUser.user_metadata?.callsign ?? "",
        email: authUser.email ?? "",
        role: isAdminEmail(authUser.email) ? "admin" : "member",
      });
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await refreshAdminAccess(session?.access_token, setServerCanAccessAdmin);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      void loadProfile(session?.user ?? null).finally(() => {
        if (!cancelled) setLoading(false);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip noisy token refreshes — they caused repeated profile reloads / UI flicker.
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        if (event === "TOKEN_REFRESHED") {
          setUser(session?.user ?? null);
        }
        return;
      }

      setUser(session?.user ?? null);
      void loadProfile(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        sanitizeAttempted = false;
        syncRoleAttempted.current = false;
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    await loadProfile(session?.user ?? null);
  }, [loadProfile]);

  const isSuperAdmin = isAdminEmail(user?.email) || isAdminEmail(profile?.email);
  const clientCanAccessAdmin = isSuperAdmin || profile?.role === "admin";
  const canAccessAdmin = serverCanAccessAdmin ?? clientCanAccessAdmin;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isLoggedIn: !!user,
      canAccessAdmin,
      isSuperAdmin,
      refreshProfile,
    }),
    [user, profile, loading, canAccessAdmin, isSuperAdmin, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
