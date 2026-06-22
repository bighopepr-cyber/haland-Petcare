"use client";

import { type ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  color?: "teal" | "blue" | "amber" | "red" | "slate";
}

const colorConfig: Record<string, { bg: string; text: string; iconBg: string }> = {
  teal: { bg: "bg-teal-50", text: "text-teal-700", iconBg: "bg-teal-100 text-teal-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", iconBg: "bg-blue-100 text-blue-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100 text-amber-600" },
  red: { bg: "bg-red-50", text: "text-red-700", iconBg: "bg-red-100 text-red-600" },
  slate: { bg: "bg-slate-50", text: "text-slate-700", iconBg: "bg-slate-100 text-slate-600" },
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = "teal",
}: StatsCardProps) {
  const colors = (colorConfig[color] ?? colorConfig["teal"])!;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md md:p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 md:text-sm">{title}</p>
          <p className="text-2xl font-bold text-slate-900 md:text-3xl">{value}</p>
          {trend && (
            <p
              className={`flex items-center gap-1 text-xs font-medium md:text-sm ${
                trend.value >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.value >= 0 ? (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              ) : (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
              {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.iconBg} md:h-12 md:w-12`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}