-- Migration untuk update User model dengan ENUM role
-- Dari String ke UserRole ENUM

-- 1. Create ENUM type
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DATA_BERKAS', 'DATA_UKUR', 'DATA_PEMETAAN', 'QUALITY_CONTROL');

-- 2. Add temporary column dengan ENUM type
ALTER TABLE "users" ADD COLUMN "role_enum" "UserRole" DEFAULT 'ADMIN'::"UserRole";

-- 3. Copy data dari column lama ke baru dengan mapping
UPDATE "users" 
SET "role_enum" = CASE 
  WHEN role = 'ADMIN' THEN 'ADMIN'::"UserRole"
  WHEN role = 'DATA_BERKAS' THEN 'DATA_BERKAS'::"UserRole"
  WHEN role = 'DATA_UKUR' THEN 'DATA_UKUR'::"UserRole"
  WHEN role = 'DATA_PEMETAAN' THEN 'DATA_PEMETAAN'::"UserRole"
  WHEN role = 'QUALITY_CONTROL' THEN 'QUALITY_CONTROL'::"UserRole"
  ELSE 'ADMIN'::"UserRole"
END;

-- 4. Drop column lama
ALTER TABLE "users" DROP COLUMN "role";

-- 5. Rename column baru ke nama lama
ALTER TABLE "users" RENAME COLUMN "role_enum" TO "role";

-- 6. Update default value
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN'::"UserRole";
