export type ThemeVariant = "professional" | "friendly";

export const theme = {
  professional: {
    primary: "slate-900",
    accent: "emerald-600",
    bg: "slate-50",
    card: "white",
    text: "slate-900",
    textSecondary: "slate-500",
    border: "slate-200",
    borderInput: "slate-300",
    focusRing: "emerald-500",
    tableRowHover: "slate-50",
    tableBorder: "slate-100",
    radius: "rounded-md",
    shadow: "shadow-sm",
    fontSize: "text-sm",
    button: "rounded-md",
    badge: {
      emerald: "bg-emerald-100 text-emerald-700",
      amber: "bg-amber-100 text-amber-700",
      red: "bg-red-100 text-red-700",
      blue: "bg-blue-100 text-blue-700",
    },
  },
  friendly: {
    primary: "teal-600",
    accent: "orange-400",
    bg: "gray-50",
    card: "white",
    text: "gray-900",
    textSecondary: "gray-500",
    border: "gray-200",
    borderInput: "gray-300",
    focusRing: "teal-500",
    tableRowHover: "gray-50",
    tableBorder: "gray-100",
    radius: "rounded-xl",
    shadow: "shadow-md",
    fontSize: "text-base",
    button: "rounded-full",
    badge: {
      emerald: "bg-emerald-100 text-emerald-700",
      amber: "bg-amber-100 text-amber-700",
      red: "bg-red-100 text-red-700",
      blue: "bg-blue-100 text-blue-700",
    },
  },
} as const;

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}