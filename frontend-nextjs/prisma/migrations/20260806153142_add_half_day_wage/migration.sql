-- AlterTable: Add half_day_wage column to positions table
ALTER TABLE "positions" ADD COLUMN "half_day_wage" INTEGER;

-- AlterEnum: Add setengah_hari value to AttendanceStatus enum
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'setengah_hari';
