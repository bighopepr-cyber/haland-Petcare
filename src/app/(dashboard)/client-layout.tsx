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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={role}
        userName={userName}
        clinicName={clinicName}
      />
      <div className="lg:pl-60">
        <Topbar
          userName={userName}
          clinicName={clinicName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}