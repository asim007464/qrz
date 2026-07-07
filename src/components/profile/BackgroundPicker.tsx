"use client";

import { cn } from "@/lib/utils";
import type { BackgroundPreset } from "@/types";
import { Check, Upload } from "lucide-react";

type BackgroundPickerProps = {
  presets: BackgroundPreset[];
  selectedId?: string;
  onSelect?: (preset: BackgroundPreset) => void;
  label?: string;
};

export function BackgroundPicker({
  presets,
  selectedId,
  onSelect,
  label = "Background",
}: BackgroundPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {presets.map((preset) => {
          const isSelected = selectedId === preset.id;
          const isGradient = preset.url.startsWith("linear-gradient");

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect?.(preset)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                isSelected
                  ? "border-ham-accent ring-2 ring-ham-accent/30"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div
                className="w-full h-full"
                style={
                  isGradient
                    ? { background: preset.url }
                    : {
                        backgroundImage: `url(${preset.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                }
              />
              {isSelected && (
                <div className="absolute inset-0 bg-ham-purple/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] py-0.5 px-1 truncate">
                {preset.name}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-ham-accent hover:bg-ham-accent/5 transition-colors"
        >
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-[9px] text-gray-500">Upload</span>
        </button>
      </div>
    </div>
  );
}
