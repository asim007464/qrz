"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface AdminNavLinkProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function AdminNavLink({ className, children = "Admin", onClick }: AdminNavLinkProps) {
  const { canAccessAdmin, loading } = useAuth();

  if (loading || !canAccessAdmin) return null;

  return (
    <Link href="/admin" className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
