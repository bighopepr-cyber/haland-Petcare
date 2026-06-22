"use client";

import { useState } from "react";
import { type ThemeVariant } from "@/lib/utils/theme";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  variant?: ThemeVariant;
}

const presets = [
  { label: "Hari Ini", getValue: () => {
    const today = new Date().toISOString().split("T")[0]!;
    return { from: today, to: today };
  }},
  { label: "Minggu Ini", getValue: () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    return {
      from: monday.toISOString().split("T")[0]!,
      to: now.toISOString().split("T")[0]!,
    };
  }},
  { label: "Bulan Ini", getValue: () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: first.toISOString().split("T")[0]!,
      to: now.toISOString().split("T")[0]!,
    };
  }},
  { label: "Tahun Ini", getValue: () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    return {
      from: first.toISOString().split("T")[0]!,
      to: now.toISOString().split("T")[0]!,
    };
  }},
];

export function DateRangePicker({
  from,
  to,
  onChange,
  variant = "professional",
}: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePreset = (preset: typeof presets[number]) => {
    const { from: f, to: t } = preset.getValue();
    setActivePreset(preset.label);
    onChange(f, t);
  };

  const inputClass =
    variant === "professional"
      ? "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md text-sm"
      : "border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-xl text-base";

  return (
    <div className="space-y-3">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activePreset === preset.label
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setActivePreset(null);
            onChange(e.target.value, to);
          }}
          className={`block w-full border bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${inputClass}`}
        />
        <span className="text-sm text-gray-500">s/d</span>
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setActivePreset(null);
            onChange(from, e.target.value);
          }}
          className={`block w-full border bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${inputClass}`}
        />
      </div>
    </div>
  );
}