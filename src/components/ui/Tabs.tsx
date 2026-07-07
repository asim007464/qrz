"use client";

import { cn } from "@/lib/utils";

type TabsProps = {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
};

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("overflow-x-auto -mx-1 px-1 scrollbar-none", className)}>
      <div className="flex gap-0.5 sm:gap-1 border-b border-gray-200 min-w-max sm:min-w-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "text-ham-purple"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 sm:ml-1.5 text-xs text-gray-400">({tab.count})</span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ham-purple rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
