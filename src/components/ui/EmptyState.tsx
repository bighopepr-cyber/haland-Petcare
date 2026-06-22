"use client";

import { type ThemeVariant } from "@/lib/utils/theme";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: ThemeVariant;
}

export function EmptyState({
  title,
  description,
  action,
  variant = "professional",
}: EmptyStateProps) {
  const sizeClass = variant === "professional" ? "h-32 w-32" : "h-40 w-40";

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Inline SVG illustration */}
      <svg
        className={`${sizeClass} mb-4 text-gray-300`}
        fill="none"
        viewBox="0 0 128 128"
        stroke="currentColor"
        strokeWidth="1"
      >
        <rect x="20" y="40" width="88" height="56" rx="8" stroke="currentColor" fill="none" />
        <circle cx="64" cy="72" r="12" stroke="currentColor" fill="none" />
        <path d="M44 40V28a4 4 0 014-4h32a4 4 0 014 4v12" stroke="currentColor" fill="none" />
        <path d="M52 64l8 8 16-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}