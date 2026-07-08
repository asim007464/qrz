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
  Radio,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "QRZ", isBrand: true },
  { href: "/card", icon: CreditCard, label: "Card" },
  { href: "/add", icon: Plus, label: "Add", isCenter: true },
  { href: "/qsl", icon: Wallet, label: "QSL" },
  { href: "/menu", icon: Settings, label: "Menu" },
];

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/auth"];

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function MobileTopBar() {
  const pathname = usePathname();

  if (isAuthPath(pathname) || pathname.startsWith("/admin") || pathname === "/contact") {
    return null;
  }

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 safe-area-pt">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-4 h-14">
        <Link href="/" className="min-w-0">
          <p className="font-bold text-ham-purple text-lg leading-tight">QRZ</p>
          <p className="text-[10px] text-gray-400 truncate">Ham Radio Social</p>
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/repeaters"
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Repeaters"
          >
            <Radio className="w-5 h-5 text-gray-600" />
          </Link>
          <Link
            href="/search"
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Search users"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  if (isAuthPath(pathname) || pathname.startsWith("/admin") || pathname === "/contact") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-pb">
      <div className="flex items-center justify-around px-1 sm:px-2 py-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/add" &&
              (pathname.startsWith("/add") ||
                pathname.startsWith("/qsl/send") ||
                pathname.startsWith("/repeaters"))) ||
            (item.href !== "/" && item.href !== "/add" && pathname.startsWith(item.href));

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-4 sm:-mt-5 px-1"
                aria-label={item.label}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-purple flex items-center justify-center shadow-lg shadow-ham-purple/30">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </Link>
            );
          }

          if ("isBrand" in item && item.isBrand) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-xl transition-colors min-w-0 flex-1 max-w-[4.5rem]",
                  isActive ? "text-ham-purple" : "text-gray-400"
                )}
                aria-label="QRZ Home"
              >
                <span
                  className={cn(
                    "text-[12px] sm:text-[13px] font-black tracking-[0.16em] leading-none",
                    isActive ? "text-ham-purple" : "text-gray-500"
                  )}
                >
                  QRZ
                </span>
              </Link>
            );
          }

          const Icon = item.icon!;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1.5 rounded-xl transition-colors min-w-0 flex-1 max-w-[4.5rem]",
                isActive ? "text-ham-purple" : "text-gray-400"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
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
    { href: "/repeaters", icon: Radio, label: "Repeaters" },
    { href: "/card", icon: CreditCard, label: "My Digital Card" },
    { href: "/qsl", icon: Wallet, label: "QSL Wallet" },
    { href: "/network", icon: Users, label: "My Network" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/download", icon: Download, label: "Download App" },
    { href: "/profile/edit", icon: UserPen, label: "Edit Profile" },
    { href: "/menu", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-ham-purple-dark text-white min-h-screen p-3 lg:p-4 shrink-0">
      <Link href="/" className="mb-6 lg:mb-8 px-2 block">
        <h1 className="text-lg lg:text-xl font-bold tracking-wide">QRZ</h1>
        <p className="text-white/50 text-xs mt-1">Ham Radio Social Network</p>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 lg:gap-3 px-2.5 lg:px-3 py-2 lg:py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link
        href="/add"
        className="mt-4 flex items-center justify-center gap-2 gradient-purple rounded-xl py-2.5 lg:py-3 text-sm font-medium border border-white/10 hover:opacity-90 transition-opacity"
      >
        <Plus className="w-5 h-5" />
        Add
      </Link>
    </aside>
  );
}
