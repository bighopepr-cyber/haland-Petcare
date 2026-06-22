"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

interface TopbarProps {
  userName: string;
  clinicName?: string;
  onMenuClick?: () => void;
}

export function Topbar({ userName, clinicName = "VetCare", onMenuClick }: TopbarProps) {
  const pathname = usePathname();

  // Generate breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
      {/* Left: Hamburger (mobile) + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="hidden items-center gap-1 text-sm text-gray-500 md:flex">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span className="mx-1 text-gray-300">/</span>}
              <span className={i === breadcrumbs.length - 1 ? "font-medium text-gray-900" : ""}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
        {/* Mobile: clinic name */}
        <h1 className="text-base font-semibold text-gray-900 md:hidden">{clinicName}</h1>
      </div>

      {/* Right: User avatar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 md:block">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}