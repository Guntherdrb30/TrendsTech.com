import { prisma } from '@trends172tech/db';

let ready = false;

export async function ensureBookingSchema() {
  if (ready) return;

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "AdminBookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminBooking" (
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
    )
  `);

  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "AdminBooking_slotKey_key" ON "AdminBooking"("slotKey")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AdminBooking_startsAt_idx" ON "AdminBooking"("startsAt")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AdminBooking_status_idx" ON "AdminBooking"("status")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AdminBooking_source_idx" ON "AdminBooking"("source")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AdminBooking_email_idx" ON "AdminBooking"("email")');

  ready = true;
}
