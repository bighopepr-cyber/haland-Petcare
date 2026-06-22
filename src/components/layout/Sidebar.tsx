"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Syringe,
  ShoppingCart,
  Package,
  FileText,
  CreditCard,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  ClipboardList,
  Stethoscope,
  Bed,
  Receipt,
  DollarSign,
  BarChart3,
  UserCircle,
} from "lucide-react";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  role: "owner" | "dokter" | "staff" | "customer";
  userName: string;
  clinicName?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const roleMenus: Record<string, SidebarItem[]> = {
  owner: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, href: "/owner" },
    { label: "Janji Temu", icon: <Calendar className="h-[18px] w-[18px]" />, href: "/owner/appointments" },
    { label: "Booking", icon: <ClipboardList className="h-[18px] w-[18px]" />, href: "/owner/booking" },
    { label: "Dokter & Staff", icon: <Users className="h-[18px] w-[18px]" />, href: "/owner/users" },
    { label: "Penjualan (POS)", icon: <ShoppingCart className="h-[18px] w-[18px]" />, href: "/owner/pos" },
    { label: "Inventori", icon: <Package className="h-[18px] w-[18px]" />, href: "/owner/inventory" },
    { label: "Laporan", icon: <FileText className="h-[18px] w-[18px]" />, href: "/owner/laporan" },
    { label: "Keuangan", icon: <DollarSign className="h-[18px] w-[18px]" />, href: "/owner/finance" },
    { label: "Analitik", icon: <BarChart3 className="h-[18px] w-[18px]" />, href: "/owner/analytics" },
    { label: "Pengaturan", icon: <Settings className="h-[18px] w-[18px]" />, href: "/owner/settings" },
  ],
  dokter: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, href: "/dokter" },
    { label: "Appointments", icon: <Calendar className="h-[18px] w-[18px]" />, href: "/dokter/appointments" },
    { label: "Rekam Medis", icon: <FileText className="h-[18px] w-[18px]" />, href: "/dokter/rekam-medis" },
    { label: "Rawat Inap", icon: <Bed className="h-[18px] w-[18px]" />, href: "/dokter/rawat-inap" },
  ],
  staff: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, href: "/staff" },
    { label: "POS / Kasir", icon: <ShoppingCart className="h-[18px] w-[18px]" />, href: "/staff/pos" },
    { label: "Inventori", icon: <Package className="h-[18px] w-[18px]" />, href: "/staff/inventory" },
    { label: "Appointments", icon: <Calendar className="h-[18px] w-[18px]" />, href: "/staff/appointments" },
    { label: "Booking", icon: <ClipboardList className="h-[18px] w-[18px]" />, href: "/staff/booking" },
    { label: "Rawat Inap", icon: <Bed className="h-[18px] w-[18px]" />, href: "/staff/rawat-inap" },
    { label: "Pengeluaran", icon: <Receipt className="h-[18px] w-[18px]" />, href: "/staff/pengeluaran" },
  ],
  customer: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, href: "/customer" },
    { label: "Hewan Saya", icon: <PawPrint className="h-[18px] w-[18px]" />, href: "/customer/hewan" },
    { label: "Monitoring", icon: <Stethoscope className="h-[18px] w-[18px]" />, href: "/customer/monitoring" },
    { label: "Rekam Medis", icon: <FileText className="h-[18px] w-[18px]" />, href: "/customer/rekam-medis" },
  ],
};

export function Sidebar({
  role,
  userName,
  clinicName = "VetCare",
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = roleMenus[role] ?? [];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/owner" && pathname === "/owner") return true;
    if (href === "/dokter" && pathname === "/dokter") return true;
    if (href === "/staff" && pathname === "/staff") return true;
    if (href === "/customer" && pathname === "/customer") return true;
    return pathname.startsWith(href + "/") || pathname === href;
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo area - 64px height */}
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-white">
            V
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{clinicName}</p>
              <p className="text-[11px] text-slate-400 capitalize truncate">{role}</p>
            </div>
          )}
        </div>
        {/* Toggle button - only on tablet/desktop */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="ml-auto hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:flex items-center justify-center shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-200 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-700" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (onMobileClose) onMobileClose();
              }}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-teal-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: user info + logout */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-medium text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-xs text-slate-400 capitalize">{role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile overlay drawer
  const mobileDrawer = mounted && mobileOpen && (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onMobileClose}
      />
      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-64 shadow-xl animate-slide-up lg:animate-none">
        {sidebarContent}
      </div>
    </div>
  );

  // Desktop sidebar
  const desktopSidebar = (
    <aside
      className={`fixed left-0 top-0 z-30 hidden h-full transition-all duration-200 lg:block ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {sidebarContent}
    </aside>
  );

  return (
    <>
      {mobileDrawer}
      {desktopSidebar}
    </>
  );
}