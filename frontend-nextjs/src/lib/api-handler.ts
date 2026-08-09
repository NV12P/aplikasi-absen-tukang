import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => Promise<NextResponse>;

/**
 * Global try/catch wrapper untuk semua API route handlers.
 */
export function apiHandler<T extends AnyFn>(fn: T): T {
  return (async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error("[API Error]", err);

      const isNeonColdStart =
        err instanceof Error &&
        (err.message.includes("E57P01") ||
          err.message.includes("P1017") ||
          err.message.includes("terminating connection") ||
          err.message.includes("Can't reach database server"));

      if (isNeonColdStart) {
        return NextResponse.json(
          { error: "Database sedang membangun koneksi. Coba lagi dalam beberapa detik.", retryable: true },
          { status: 503 }
        );
      }

      const message =
        process.env.NODE_ENV === "development" && err instanceof Error
          ? err.message
          : "Terjadi kesalahan server. Coba beberapa saat lagi.";

      return NextResponse.json({ error: message }, { status: 500 });
    }
  }) as T;
}
