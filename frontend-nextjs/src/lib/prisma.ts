import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client dengan retry logic untuk Neon PostgreSQL.
 *
 * Neon free tier auto-suspend setelah idle — koneksi pertama setelah
 * "cold start" bisa gagal dengan E57P01 (admin_shutdown).
 * Solusi: retry otomatis dengan exponential backoff.
 *
 * Optimasi performa:
 * - connection_limit=5  : batasi koneksi agar tidak overload serverless
 * - connect_timeout=10  : timeout cepat agar cold start tidak gantung terlalu lama
 * - pool_timeout=10     : timeout menunggu koneksi dari pool
 * - pgbouncer=true      : aktifkan jika pakai Neon connection pooler (port 6543)
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Inject parameter pooling ke DATABASE_URL jika belum ada
function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    // Tambah parameter jika belum ada
    if (!parsed.searchParams.has("connection_limit"))
      parsed.searchParams.set("connection_limit", "5");
    if (!parsed.searchParams.has("connect_timeout"))
      parsed.searchParams.set("connect_timeout", "10");
    if (!parsed.searchParams.has("pool_timeout"))
      parsed.searchParams.set("pool_timeout", "10");
    return parsed.toString();
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasourceUrl: buildDatasourceUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Jalankan query Prisma dengan retry otomatis.
 * Berguna untuk menangani Neon cold start (E57P01 / P1017).
 *
 * @param fn      Fungsi yang berisi operasi Prisma
 * @param retries Jumlah maksimal percobaan ulang (default: 3)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isConnectionError =
        err instanceof Error &&
        (err.message.includes("E57P01") ||
          err.message.includes("P1017") ||
          err.message.includes("Connection refused") ||
          err.message.includes("terminating connection") ||
          err.message.includes("Can't reach database server"));

      if (!isConnectionError || attempt === retries) {
        throw err;
      }

      // Exponential backoff: 300ms, 600ms, 1200ms (lebih cepat dari sebelumnya)
      const delay = 300 * Math.pow(2, attempt - 1);
      console.warn(
        `[Prisma] Koneksi gagal (attempt ${attempt}/${retries}), retry dalam ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Disconnect dan reconnect paksa
      await prisma.$disconnect().catch(() => {});
    }
  }

  throw lastError;
}
