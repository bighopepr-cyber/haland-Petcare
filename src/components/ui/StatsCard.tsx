"use client";

import { type ReactNode } from "react";
import { type ThemeVariant } from "@/lib/utils/theme";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  color?: "emerald" | "blue" | "amber" | "red" | "slate";
  variant?: ThemeVariant;
}

const colorClasses = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-50 text-slate-600",
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "emerald",
  variant = "professional",
}: StatsCardProps) {
  const radiusClass = variant === "professional" ? "rounded-lg" : "rounded-xl";
  const paddingClass = variant === "professional" ? "p-4" : "p-6";
  const valueSize = variant === "professional" ? "text-2xl" : "text-3xl";

  return (
    <div className={`bg-white border shadow-sm ${radiusClass} ${paddingClass}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`${valueSize} font-bold text-gray-900`}>{value}</p>
          {trend && (
            <p
              className={`text-sm ${
                trend.value >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`rounded-full p-2 ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}