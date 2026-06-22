"use client";

import { type ThemeVariant } from "@/lib/utils/theme";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  variant?: ThemeVariant;
}

export function Input({
  label,
  error,
  hint,
  icon,
  variant = "professional",
  className = "",
  required,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const baseStyles =
    variant === "professional"
      ? "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md text-sm"
      : "border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-xl text-base";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          className={`block w-full border bg-white px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${
            icon ? "pl-10" : ""
          } ${baseStyles} ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}