"use client";

import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="border-b border-slate-200 pb-4 mb-6">
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-slate-500 mb-2">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-300">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-teal-600 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-slate-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title + Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}