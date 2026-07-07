import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export interface AdminProfile {
  id: string;
  role: string;
  email: string;
  name: string;
}

export interface AdminSession {
  user: User;
  profile: AdminProfile;
  isSuperAdmin: boolean;
}

async function getBearerUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user?.email) return null;
  return user;
}

export async function verifyAdminSession(request: Request): Promise<AdminSession | null> {
  const user = await getBearerUser(request);
  if (!user) return null;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, email, name, is_blocked")
    .eq("id", user.id)
    .maybeSingle();
  const isSuperAdmin = isAdminEmail(user.email) || isAdminEmail(profile?.email);
  if (!isSuperAdmin && profile?.role !== "admin") return null;
  if (profile?.is_blocked) return null;
  return {
    user,
    profile: profile
      ? { id: profile.id, role: profile.role, email: profile.email ?? user.email!, name: profile.name ?? "" }
      : { id: user.id, role: "admin", email: user.email!, name: "" },
    isSuperAdmin,
  };
}

export async function verifySuperAdminSession(request: Request): Promise<AdminSession | null> {
  const session = await verifyAdminSession(request);
  if (!session?.isSuperAdmin) return null;
  return session;
}
