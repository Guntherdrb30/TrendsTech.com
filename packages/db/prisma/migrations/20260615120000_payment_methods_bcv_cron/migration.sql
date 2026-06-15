-- CreateEnum
CREATE TYPE "ManualPaymentMethod" AS ENUM ('ZELLE', 'BINANCE', 'PAGO_MOVIL');

-- AlterTable ManualPayment: add paymentMethod, amountUsd, reviewNotes + status index
ALTER TABLE "ManualPayment"
  ADD COLUMN "paymentMethod" "ManualPaymentMethod" NOT NULL DEFAULT 'ZELLE',
  ADD COLUMN "amountUsd" DECIMAL(12,2),
  ADD COLUMN "reviewNotes" TEXT;

CREATE INDEX IF NOT EXISTS "ManualPayment_status_idx" ON "ManualPayment"("status");

-- AlterTable GlobalSettings: add Binance, PagoMovil, vesMarkup, bcvRateUpdatedAt
ALTER TABLE "GlobalSettings"
  ADD COLUMN "binanceEmail"       TEXT,
  ADD COLUMN "pagoMovilPhone"     TEXT,
  ADD COLUMN "pagoMovilBank"      TEXT,
  ADD COLUMN "pagoMovilCedula"    TEXT,
  ADD COLUMN "vesMarkupPercent"   DECIMAL(5,2) NOT NULL DEFAULT 30,
  ADD COLUMN "bcvRateUpdatedAt"   TIMESTAMP(3);

-- Seed payment details for id=1
UPDATE "GlobalSettings"
SET
  "binanceEmail"    = 'gunther.delrosario@gmail.com',
  "pagoMovilPhone"  = '04245623306',
  "pagoMovilBank"   = 'Banesco',
  "pagoMovilCedula" = '15886738',
  "zelleEmail"      = COALESCE("zelleEmail", 'gunther.delrosario@gmail.com'),
  "zelleRecipientName" = COALESCE("zelleRecipientName", 'Gunther Del Rosario')
WHERE id = 1;
