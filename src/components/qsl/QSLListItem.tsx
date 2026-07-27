"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { QSLCard, QSLTemplate } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { DEFAULT_QSL_TEMPLATE } from "@/lib/qslUtils";
import { QSLCardTemplate } from "./QSLCardTemplate";
import { cn } from "@/lib/utils";

type QSLListItemProps = {
  card: QSLCard;
  template?: QSLTemplate | null;
  showActions?: boolean;
};

const statusVariant: Record<QSLCard["status"], "success" | "warning" | "danger" | "default"> = {
  accepted: "success",
  pending: "warning",
  rejected: "danger",
  sent: "default",
};

export function QSLListItem({ card, template, showActions = true }: QSLListItemProps) {
  const tpl = template || DEFAULT_QSL_TEMPLATE;

  return (
    <Link href={`/qsl/${card.id}`} className="block">
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
        <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 shadow-sm">
          <div
            className="w-full h-full scale-[0.35] origin-top-left"
            style={{ width: "182%", height: "182%" }}
          >
            <QSLCardTemplate card={card} template={tpl} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ham-purple">{card.fromCallsign}</span>
            <span className="text-gray-400 text-sm">→</span>
            <span className="font-medium text-gray-700">{card.toCallsign}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {card.date} · {card.utc} UTC · {card.mhz} MHz · {card.mode}
          </p>
          <p className="text-xs text-gray-400 hidden sm:block">{card.fromCountry}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant={statusVariant[card.status]}>
            {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
          </Badge>
          {showActions && (
            <button
              onClick={(e) => e.preventDefault()}
              className="p-1 rounded-lg hover:bg-gray-100"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

type QSLStatCardProps = {
  label: string;
  value: number;
  highlight?: boolean;
};

export function QSLStatCard({ label, value, highlight }: QSLStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-2.5 sm:p-3 text-center",
        highlight ? "gradient-purple text-white" : "bg-white border border-gray-100"
      )}
    >
      <p className={cn("text-xl sm:text-2xl font-bold", !highlight && "text-ham-purple")}>{value}</p>
      <p className={cn("text-xs mt-0.5", highlight ? "text-white/70" : "text-gray-500")}>
        {label}
      </p>
    </div>
  );
}
