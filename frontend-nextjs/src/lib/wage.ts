import type { AttendanceStatus } from "@/generated/client";

/**
 * Kalkulasi upah berdasarkan status absensi dan posisi pekerja.
 * Migrasi langsung dari WageCalculatorService.php di Laravel.
 *
 * @param status      - Status absensi (hadir | lembur | cor | alpha)
 * @param dailyWage   - Upah harian dari tabel positions
 * @param overtimeWage - Tambahan upah lembur dari tabel positions
 * @param castingWage - Upah cor dari tabel positions
 * @returns Nominal upah untuk hari tersebut (integer, dalam rupiah)
 */
export function calculateWage(
  status: AttendanceStatus,
  dailyWage?: number | null,
  overtimeWage?: number | null,
  castingWage?: number | null
): number {
  const daily = dailyWage ?? 0;
  const overtime = overtimeWage ?? 0;
  const casting = castingWage ?? 0;

  switch (status) {
    case "hadir":
      return daily;
    case "lembur":
      return daily + overtime;
    case "cor":
      return casting;
    case "alpha":
      return 0;
    default:
      return 0;
  }
}

/**
 * Format angka ke format mata uang Rupiah.
 * Setara dengan CurrencyHelper.php di Laravel.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
