-- AlterTable: Add project_id column to attendances
ALTER TABLE "attendances" ADD COLUMN "project_id" BIGINT;

-- Populate project_id from worker's project
UPDATE "attendances" 
SET "project_id" = (
  SELECT "project_id" 
  FROM "workers" 
  WHERE "workers"."id" = "attendances"."worker_id"
);

-- Make project_id NOT NULL
ALTER TABLE "attendances" ALTER COLUMN "project_id" SET NOT NULL;

-- Drop old unique constraint
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_worker_id_date_key";

-- Add new unique constraint with project_id
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_worker_id_project_id_date_key" UNIQUE ("worker_id", "project_id", "date");

-- Add foreign key
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index
CREATE INDEX "attendances_project_id_idx" ON "attendances"("project_id");
