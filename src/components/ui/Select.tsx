"use client";

import { type ThemeVariant } from "@/lib/utils/theme";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: ThemeVariant;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  variant = "professional",
  className = "",
  required,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const baseStyles =
    variant === "professional"
      ? "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md text-sm"
      : "border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-xl text-base";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`block w-full border bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-50 ${baseStyles} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}