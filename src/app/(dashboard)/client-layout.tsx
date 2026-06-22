"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface DashboardClientLayoutProps {
  role: "owner" | "dokter" | "staff" | "customer";
  userName: string;
  clinicName?: string;
  children: ReactNode;
}

export function DashboardClientLayout({
  role,
  userName,
  clinicName = "VetCare",
  children,
}: DashboardClientLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleMobileOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface-1">
      <Sidebar
        role={role}
        userName={userName}
        clinicName={clinicName}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      <div
        className={`transition-all duration-200 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <Topbar
          userName={userName}
          clinicName={clinicName}
          onMenuClick={handleMobileOpen}
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="min-h-[calc(100vh-4rem)] px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}