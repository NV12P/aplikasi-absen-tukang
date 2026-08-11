"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-[19px] h-[19px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/proyek",
    label: "Proyek",
    icon: (
      <svg className="w-[19px] h-[19px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" strokeWidth={1.75} />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/pekerja",
    label: "Kelola Pekerja",
    icon: (
      <svg className="w-[19px] h-[19px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/master-data",
    label: "Master Data Jabatan",
    icon: (
      <svg className="w-[19px] h-[19px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/input-absensi",
    label: "Input Absensi",
    icon: (
      <svg className="w-[19px] h-[19px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={1.75} />
        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.75} />
        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.75} />
        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.75} />
      </svg>
    ),
  },
  {
    href: "/rekap-absensi",
    label: "Rekap Absensi",
    icon: (
      <svg className="w-[19px] h-[19px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" strokeWidth={1.75} strokeLinecap="round" />
        <line x1="12" y1="20" x2="12" y2="4" strokeWidth={1.75} strokeLinecap="round" />
        <line x1="6" y1="20" x2="6" y2="14" strokeWidth={1.75} strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* ── Mobile Overlay ────────────────────────────────────────────────── */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "active" : ""}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* ── Sidebar Container ────────────────────────────────────────────── */}
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        {/* Header Branding */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="sidebar-brand-text">
              <h1>CV Fortuna Aeterna</h1>
              <p>Absensi & Kelola Pekerja</p>
            </div>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={onMobileClose}
            aria-label="Tutup menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">NAVIGASI UTAMA</div>

          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`nav-item ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="nav-item-icon">{item.icon}</div>
                <span className="nav-item-text">{item.label}</span>
                <svg className="w-4 h-4 nav-item-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout & App Version */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar Aplikasi</span>
          </button>
          <div className="sidebar-version">v1.0.0 • Enterprise Edition</div>
        </div>
      </aside>
    </>
  );
}
