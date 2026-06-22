"use client";

import { type ThemeVariant } from "@/lib/utils/theme";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  done: "bg-emerald-100 text-emerald-700",
  stable: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  scheduled: "bg-amber-100 text-amber-700",
  inactive: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-800 font-semibold",
  in_progress: "bg-blue-100 text-blue-700",
  improving: "bg-blue-100 text-blue-700",
  discharged: "bg-gray-100 text-gray-700",
};

interface BadgeProps {
  value: string;
  variant?: ThemeVariant;
  className?: string;
}

export function Badge({ value, variant = "professional", className = "" }: BadgeProps) {
  const colorClass = statusColors[value.toLowerCase()] ?? "bg-gray-100 text-gray-700";
  const sizeClass = variant === "professional" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${colorClass} ${className}`}
    >
      {value}
    </span>
  );
}