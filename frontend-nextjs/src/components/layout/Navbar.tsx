"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { SessionUser } from "@/types";

interface NavbarProps {
  user: SessionUser;
  onMenuToggle: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/proyek": "Kelola Proyek Konstruksi",
  "/pekerja": "Kelola Data Pekerja",
  "/input-absensi": "Input Absensi Harian",
  "/rekap-absensi": "Rekap Absensi Pekerja",
  "/master-data": "Master Data Pekerja",
};

export function Navbar({ user, onMenuToggle }: NavbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentTitle = pageTitles[pathname] || "Dashboard Overview";

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Tombol hamburger — hanya tampil di mobile */}
        <button
          className="hamburger-btn"
          onClick={onMenuToggle}
          aria-label="Buka menu"
        >
          <svg className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="page-title">{currentTitle}</div>
      </div>

      <div className="header-right">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="user-profile hover:opacity-85 transition-opacity"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            <span className="user-name">{user.name || "Admin"}</span>
            <div className="user-avatar flex items-center justify-center bg-stone-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-stone-500"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e5e2db] z-20 overflow-hidden">
                <div className="px-4 py-3 bg-[#fbf9f4] border-b border-[#e5e2db]">
                  <p className="text-sm font-bold text-stone-800 truncate">{user.name}</p>
                  <p className="text-xs text-stone-500 truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar Aplikasi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
