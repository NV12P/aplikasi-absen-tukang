import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client dengan retry logic untuk Neon PostgreSQL.
 *
 * Neon free tier auto-suspend setelah idle — koneksi pertama setelah
 * "cold start" bisa gagal dengan E57P01 (admin_shutdown).
 * Solusi: retry otomatis dengan exponential backoff.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Datasource override untuk memastikan connection string terbaca
    datasourceUrl: process.env.DATABASE_URL,
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
        (err.message.includes("E57P01") ||          // admin_shutdown (Neon cold start)
          err.message.includes("P1017") ||           // Prisma: server closed connection
          err.message.includes("Connection refused") ||
          err.message.includes("terminating connection"));

      if (!isConnectionError || attempt === retries) {
        throw err;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delay = 500 * Math.pow(2, attempt - 1);
      console.warn(`[Prisma] Koneksi gagal (attempt ${attempt}/${retries}), retry dalam ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Disconnect dan reconnect paksa
      await prisma.$disconnect().catch(() => {});
    }
  }

  throw lastError;
}
