"use client";

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  done: "bg-emerald-100 text-emerald-700",
  stable: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  improving: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
  inactive: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-800 font-semibold",
  in_progress: "bg-blue-100 text-blue-700",
  discharged: "bg-slate-100 text-slate-700",
  product: "bg-teal-100 text-teal-700",
  service: "bg-purple-100 text-purple-700",
  in: "bg-emerald-100 text-emerald-700",
  out: "bg-amber-100 text-amber-700",
  adjustment: "bg-blue-100 text-blue-700",
};

const dotColors: Record<string, string> = {
  active: "bg-emerald-500",
  paid: "bg-emerald-500",
  confirmed: "bg-emerald-500",
  done: "bg-emerald-500",
  stable: "bg-emerald-500",
  completed: "bg-emerald-500",
  improving: "bg-emerald-500",
  scheduled: "bg-amber-500",
  pending: "bg-amber-500",
  inactive: "bg-red-500",
  cancelled: "bg-red-500",
  rejected: "bg-red-500",
  critical: "bg-red-600",
  in_progress: "bg-blue-500",
  discharged: "bg-slate-500",
  product: "bg-teal-500",
  service: "bg-purple-500",
  in: "bg-emerald-500",
  out: "bg-amber-500",
  adjustment: "bg-blue-500",
};

interface BadgeProps {
  value: string;
  className?: string;
}

export function Badge({ value, className = "" }: BadgeProps) {
  const key = value.toLowerCase();
  const colorClass = statusColors[key] ?? "bg-slate-100 text-slate-700";
  const dotClass = dotColors[key] ?? "bg-slate-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {value}
    </span>
  );
}