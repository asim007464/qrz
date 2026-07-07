"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, backHref, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-4 md:mb-6", className)}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {backHref && (
          <Link
            href={backHref}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
        )}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-ham-purple truncate">{title}</h1>
      </div>
      {action && <div className="shrink-0 flex items-center gap-1">{action}</div>}
    </div>
  );
}
