-- Manual migration: Remove isForeman from positions, Create foremen table
-- Run this manually to avoid data loss

-- Step 1: Create foremen table
CREATE TABLE IF NOT EXISTS "foremen" (
    "id" BIGSERIAL PRIMARY KEY,
    "project_id" BIGINT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "foremen_project_id_fkey" FOREIGN KEY ("project_id") 
        REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 2: Remove is_foreman column from positions (if exists)
-- This is safe as we're not using this data anymore
ALTER TABLE "positions" DROP COLUMN IF EXISTS "is_foreman";

-- Step 3: Create index for foremen
CREATE INDEX IF NOT EXISTS "foremen_project_id_idx" ON "foremen"("project_id");
