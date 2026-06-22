"use client";

import { type ThemeVariant } from "@/lib/utils/theme";

interface LoadingSkeletonProps {
  variant?: "table" | "card" | "page" | "stats";
  theme?: ThemeVariant;
}

export function LoadingSkeleton({ variant = "table", theme = "professional" }: LoadingSkeletonProps) {
  const rows = variant === "table" ? 5 : variant === "stats" ? 4 : 1;
  const radiusClass = theme === "professional" ? "rounded-md" : "rounded-xl";

  if (variant === "page") {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className={`h-8 w-64 bg-gray-200 ${radiusClass}`} />
        <div className={`h-4 w-96 bg-gray-200 ${radiusClass}`} />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-24 bg-gray-200 ${radiusClass}`} />
          ))}
        </div>
        <div className={`h-64 bg-gray-200 ${radiusClass}`} />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`animate-pulse space-y-3 border p-4 ${radiusClass}`}>
        <div className={`h-4 w-24 bg-gray-200 ${radiusClass}`} />
        <div className={`h-8 w-32 bg-gray-200 ${radiusClass}`} />
        <div className={`h-3 w-20 bg-gray-200 ${radiusClass}`} />
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`border p-4 space-y-2 ${radiusClass}`}>
            <div className={`h-3 w-16 bg-gray-200 ${radiusClass}`} />
            <div className={`h-7 w-24 bg-gray-200 ${radiusClass}`} />
            <div className={`h-3 w-12 bg-gray-200 ${radiusClass}`} />
          </div>
        ))}
      </div>
    );
  }

  // table variant
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-gray-200 ${radiusClass} ${
                j === 0 ? "w-1/4" : j === 1 ? "w-1/3" : j === 2 ? "w-1/4" : "w-1/6"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}