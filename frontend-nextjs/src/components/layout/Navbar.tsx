"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import type { SessionUser } from "@/types";

interface NavbarProps {
  user: SessionUser;
  onMenuToggle: () => void;
}

export function Navbar({ user, onMenuToggle }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-stone-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">

      {/* Kiri: hamburger (mobile) */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl text-stone-500 hover:bg-amber-50 hover:text-amber-600
                   transition-colors"
        aria-label="Buka menu navigasi"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop kiri: spacer */}
      <div className="hidden lg:block" />

      {/* Kanan: user menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 sm:gap-2.5 hover:bg-amber-50 rounded-xl
                     px-2 sm:px-2.5 py-1.5 transition-colors"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-gradient flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <span className="font-semibold text-stone-700 text-sm hidden sm:block max-w-[120px] truncate">
            {user.name}
          </span>
          <svg className="w-3.5 h-3.5 text-stone-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-md
                            border border-stone-100 z-20 overflow-hidden">
              <div className="px-4 py-3.5 bg-amber-50/60 border-b border-amber-100">
                <p className="text-sm font-semibold text-stone-800 truncate">{user.name}</p>
                <p className="text-xs text-stone-500 truncate mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600
                           hover:bg-red-50 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
