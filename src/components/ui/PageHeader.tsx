"use client";

import { type ReactNode } from "react";
import { type ThemeVariant } from "@/lib/utils/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  variant?: ThemeVariant;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  variant = "professional",
}: PageHeaderProps) {
  const spacingClass = variant === "professional" ? "mb-6" : "mb-8";

  return (
    <div className={`flex items-start justify-between ${spacingClass}`}>
      <div className="space-y-1">
        <h1
          className={`font-bold text-gray-900 ${
            variant === "professional" ? "text-xl" : "text-2xl"
          }`}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}