"use client";

import { useEffect } from "react";

/**
 * Error boundary untuk semua halaman di (dashboard).
 * Menangkap runtime error di Server Components maupun Client Components.
 * WAJIB 'use client' — Next.js requirement untuk error.tsx.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Di production, kirim ke error monitoring (Sentry, etc.)
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md p-8 card">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || "Sesuatu yang tidak terduga terjadi. Coba lagi."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Coba Lagi
          </button>
          <a href="/dashboard" className="btn-secondary">
            Ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
