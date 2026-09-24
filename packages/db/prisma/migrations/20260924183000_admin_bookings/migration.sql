CREATE TYPE "AdminBookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');

CREATE TABLE "AdminBooking" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Caracas',
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "status" "AdminBookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "meetingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminBooking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminBooking_slotKey_key" ON "AdminBooking"("slotKey");
CREATE INDEX "AdminBooking_startsAt_idx" ON "AdminBooking"("startsAt");
CREATE INDEX "AdminBooking_status_idx" ON "AdminBooking"("status");
CREATE INDEX "AdminBooking_source_idx" ON "AdminBooking"("source");
CREATE INDEX "AdminBooking_email_idx" ON "AdminBooking"("email");
