"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  Plus,
  Wallet,
  Settings,
  Search,
  Users,
  BarChart3,
  UserPen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/card", icon: CreditCard, label: "Card" },
  { href: "/qsl/send", icon: Plus, label: "Add", isCenter: true },
  { href: "/qsl", icon: Wallet, label: "QSL" },
  { href: "/menu", icon: Settings, label: "Menu" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full gradient-purple flex items-center justify-center shadow-lg shadow-ham-purple/30">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                isActive ? "text-ham-purple" : "text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();

  const sidebarItems = [
    { href: "/", icon: Home, label: "Home Feed" },
    { href: "/search", icon: Search, label: "Search Users" },
    { href: "/card", icon: CreditCard, label: "My Digital Card" },
    { href: "/qsl", icon: Wallet, label: "QSL Wallet" },
    { href: "/network", icon: Users, label: "My Network" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/profile/edit", icon: UserPen, label: "Edit Profile" },
    { href: "/menu", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-ham-purple-dark text-white min-h-screen p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold tracking-wide">QRZ</h1>
        <p className="text-white/50 text-xs mt-1">Ham Radio Social Network</p>
      </div>

      <nav className="flex-1 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/qsl/send"
        className="mt-4 flex items-center justify-center gap-2 gradient-purple rounded-xl py-3 text-sm font-medium border border-white/10 hover:opacity-90 transition-opacity"
      >
        <Plus className="w-5 h-5" />
        Send QSL Card
      </Link>
    </aside>
  );
}
