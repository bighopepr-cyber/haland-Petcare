"use client";

import { useState } from "react";
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
}

const roleMenus: Record<string, SidebarItem[]> = {
  owner: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/owner" },
    { label: "Janji Temu", icon: <Calendar className="h-5 w-5" />, href: "/owner/appointments" },
    { label: "Dokter & Staff", icon: <Users className="h-5 w-5" />, href: "/owner/staff" },
    { label: "Pasien", icon: <Syringe className="h-5 w-5" />, href: "/owner/pets" },
    { label: "Penjualan", icon: <ShoppingCart className="h-5 w-5" />, href: "/owner/pos" },
    { label: "Inventori", icon: <Package className="h-5 w-5" />, href: "/owner/inventory" },
    { label: "Laporan", icon: <FileText className="h-5 w-5" />, href: "/owner/reports" },
    { label: "Keuangan", icon: <CreditCard className="h-5 w-5" />, href: "/owner/finance" },
    { label: "Analitik", icon: <TrendingUp className="h-5 w-5" />, href: "/owner/analytics" },
    { label: "Pengaturan", icon: <Settings className="h-5 w-5" />, href: "/owner/settings" },
  ],
  dokter: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dokter" },
    { label: "Jadwal", icon: <Calendar className="h-5 w-5" />, href: "/dokter/schedule" },
    { label: "Pasien", icon: <Users className="h-5 w-5" />, href: "/dokter/patients" },
    { label: "Rekam Medis", icon: <FileText className="h-5 w-5" />, href: "/dokter/records" },
    { label: "Rawat Inap", icon: <Syringe className="h-5 w-5" />, href: "/dokter/inpatient" },
  ],
  staff: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/staff" },
    { label: "POS / Kasir", icon: <ShoppingCart className="h-5 w-5" />, href: "/staff/pos" },
    { label: "Inventori", icon: <Package className="h-5 w-5" />, href: "/staff/inventory" },
    { label: "Janji Temu", icon: <Calendar className="h-5 w-5" />, href: "/staff/appointments" },
    { label: "Pasien", icon: <Users className="h-5 w-5" />, href: "/staff/pets" },
  ],
  customer: [
    { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/customer" },
    { label: "Hewan Saya", icon: <Syringe className="h-5 w-5" />, href: "/customer/pets" },
    { label: "Janji Temu", icon: <Calendar className="h-5 w-5" />, href: "/customer/appointments" },
    { label: "Riwayat", icon: <FileText className="h-5 w-5" />, href: "/customer/history" },
  ],
};

export function Sidebar({ role, userName, clinicName = "VetCare" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = roleMenus[role] ?? [];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">
            V
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold">{clinicName}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:block"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-medium text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="h-full w-64 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-full transition-all duration-200 lg:block ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}