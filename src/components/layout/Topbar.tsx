"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell, ChevronDown, LogOut, Settings, User, X } from "lucide-react";

interface TopbarProps {
  userName: string;
  clinicName?: string;
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

export function Topbar({
  userName,
  clinicName = "VetCare",
  onMenuClick,
  onToggleSidebar,
  sidebarCollapsed = false,
}: TopbarProps) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  // Get current page name for mobile
  const currentPage = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1]!.label : "Dashboard";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile: hamburger menu */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Tablet: toggle sidebar button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:flex xl:hidden"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Desktop: breadcrumb */}
        <nav className="hidden items-center gap-1 text-sm text-slate-500 md:flex min-w-0">
          <span className="font-medium text-slate-900">VetCare</span>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              <span className="text-slate-300 mx-1 shrink-0">/</span>
              <span
                className={`truncate ${
                  i === breadcrumbs.length - 1
                    ? "font-medium text-slate-900"
                    : "text-slate-500"
                }`}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>

        {/* Mobile: page name */}
        <h1 className="text-base font-semibold text-slate-900 md:hidden truncate">
          {currentPage}
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-medium text-slate-700 md:block">
              {userName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{clinicName}</p>
              </div>
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <User className="h-4 w-4" />
                Profil
              </button>
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Settings className="h-4 w-4" />
                Pengaturan
              </button>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}