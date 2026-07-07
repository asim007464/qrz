"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, MessageSquare, CreditCard, Megaphone,
  Home, LogOut, Menu, X, BarChart3,
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
  { href: "/admin/templates", label: "QSL Templates", icon: CreditCard },
  { href: "/admin/broadcast", label: "Broadcast", icon: Megaphone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleSignOut() {
    setMobileOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="admin-sidebar-head">
        <BrandMark size="nav" />
        {!loading && profile && (
          <div className="admin-user-card">
            <p className="admin-user-name">{profile.name || "Admin"}</p>
            <p className="admin-user-email no-cap">{profile.email}</p>
            <p className="admin-user-role">Admin</p>
          </div>
        )}
      </div>

      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        {adminLinks.map((link) => {
          const active = isActive(pathname, link.href, link.exact);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`admin-sidebar-link ${active ? "active" : ""}`}
            >
              <Icon size={16} aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-foot">
        <Link href="/" onClick={() => setMobileOpen(false)} className="admin-sidebar-link">
          <Home size={16} aria-hidden />
          Back to website
        </Link>
        <button type="button" onClick={handleSignOut} className="admin-sidebar-link admin-sidebar-btn">
          <LogOut size={16} aria-hidden />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="admin-sidebar-spacer" aria-hidden="true" />

      <div className="admin-mobile-bar">
        <BrandMark size="nav" />
        <button type="button" onClick={() => setMobileOpen(true)} className="admin-menu-btn" aria-label="Open admin menu">
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <button type="button" aria-label="Close admin menu" className="admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <button type="button" onClick={() => setMobileOpen(false)} className="admin-close-btn" aria-label="Close menu">
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
