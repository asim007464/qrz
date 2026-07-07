"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, isLoggedIn, canAccessAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn || !canAccessAdmin) {
      router.replace("/login?next=/admin");
    }
  }, [loading, isLoggedIn, canAccessAdmin, router]);

  if (loading || !canAccessAdmin) {
    return (
      <div className="admin-shell">
        <div className="admin-loading">
          <p className="section-sub">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
