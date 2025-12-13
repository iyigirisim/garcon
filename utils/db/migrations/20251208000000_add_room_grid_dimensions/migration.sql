-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "gridWidth" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "gridHeight" INTEGER NOT NULL DEFAULT 3;

-- Update existing rooms to have 3x3 grid
UPDATE "public"."Room" SET "gridWidth" = 3, "gridHeight" = 3 WHERE "gridWidth" IS NULL OR "gridHeight" IS NULL;

