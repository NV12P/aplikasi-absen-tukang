import { NextResponse } from "next/server";

/**
 * Global try/catch wrapper untuk semua API route handlers.
 * Menangani dua jenis error:
 * 1. Error umum — return 500 dengan pesan generik
 * 2. Neon cold start (E57P01 / P1017) — return 503 dengan instruksi retry
 */
export function apiHandler(
  fn: (...args: Parameters<typeof fn>) => Promise<NextResponse>
) {
  return async (...args: Parameters<typeof fn>): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error("[API Error]", err);

      // Deteksi Neon cold start / connection terminated
      const isNeonColdStart =
        err instanceof Error &&
        (err.message.includes("E57P01") ||
          err.message.includes("P1017") ||
          err.message.includes("terminating connection") ||
          err.message.includes("Can't reach database server"));

      if (isNeonColdStart) {
        return NextResponse.json(
          {
            error: "Database sedang membangun koneksi. Coba lagi dalam beberapa detik.",
            retryable: true,
          },
          { status: 503 }
        );
      }

      const message =
        process.env.NODE_ENV === "development" && err instanceof Error
          ? err.message
          : "Terjadi kesalahan server. Coba beberapa saat lagi.";

      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
