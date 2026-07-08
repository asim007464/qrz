"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPen,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  LogIn,
  Radio,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { currentUser } from "@/lib/mock-data";

const menuItems = [
  { href: "/profile/edit", icon: UserPen, label: "Edit Profile" },
  { href: "/card", icon: CreditCard, label: "My Digital Card" },
  { href: "/repeaters", icon: Radio, label: "Repeaters" },
  { href: "/network", icon: Users, label: "My Network" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/download", icon: Download, label: "Download App" },
  { href: "/contact", icon: HelpCircle, label: "Help & Support" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function MenuPage() {
  const router = useRouter();
  const { isLoggedIn, canAccessAdmin, profile, loading } = useAuth();

  const displayUser = profile
    ? {
        ...currentUser,
        callsign: profile.callsign || currentUser.callsign,
        name: profile.name || currentUser.name,
        email: profile.email || currentUser.email,
      }
    : currentUser;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <AppShell>
      <ProfileBanner user={displayUser} compact className="mb-4" />

      {!loading && !isLoggedIn && (
        <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-4 mb-4">
          <p className="text-sm text-gray-600 mb-3">Sign in to sync your profile, QSL cards, and network.</p>
          <div className="flex gap-2">
            <Link href="/login" className="flex-1 text-center py-2.5 rounded-xl gradient-purple text-white text-sm font-medium">
              Sign In
            </Link>
            <Link href="/register" className="flex-1 text-center py-2.5 rounded-xl border border-ham-purple text-ham-purple text-sm font-medium">
              Register
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        {menuItems.map((item, i) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
              i < menuItems.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <item.icon className="w-5 h-5 text-ham-purple" />
            <span className="flex-1 text-sm font-medium text-gray-800">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ))}

        {canAccessAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-50"
          >
            <Shield className="w-5 h-5 text-ham-purple" />
            <span className="flex-1 text-sm font-medium text-gray-800">Admin Panel</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        )}

        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-red-50 transition-colors text-red-600 border-t border-gray-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-50"
          >
            <LogIn className="w-5 h-5 text-ham-purple" />
            <span className="text-sm font-medium text-gray-800">Sign In</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        )}
      </div>
    </AppShell>
  );
}
