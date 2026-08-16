BEGIN;

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELED'
);

ALTER TABLE "Order"
  ALTER COLUMN "status" TYPE "OrderStatus"
  USING (
    CASE
      WHEN "status"::text = 'COMPLETED' THEN 'DELIVERED'::"OrderStatus"
      ELSE "status"::text::"OrderStatus"
    END
  );

DROP TYPE "OrderStatus_old";

ALTER TABLE "Order"
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OrderStatus";

COMMIT;