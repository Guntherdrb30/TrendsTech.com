/** Integration tests require a dedicated disposable PostgreSQL test database.
 * They must not be run against production Neon.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Prisma, prisma } from '@trends172tech/db';
import { randomUUID } from 'node:crypto';
import { reserveStudioSpend, releaseUnbilledReservation, settleStudioSpend } from '../../app/lib/engineering-studio/spend-guard';

const enabled = process.env.STUDIO_SPEND_TEST_DATABASE === '1' &&
  process.env.NODE_ENV === 'test' &&
  /test|localhost|127\.0\.0\.1/i.test(process.env.DATABASE_URL || '');
const projectId = randomUUID();
const suite = enabled ? describe : describe.skip;

suite('spend guard DB integration (disposable test DB only)', () => {
  beforeAll(async () => {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "StudioProject" ("id","name","mode","stage","status","currency")
      VALUES (${projectId},'GNB spend guard test','CREATE','IDEA','ACTIVE','USD')
    `);
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "StudioProjectSpendBudget"
      ("projectId","activeLimitCents","globalCeilingCents","confirmedCents","reservedCents","paused")
      VALUES (${projectId},1000,10000,0,0,false)
    `);
  });
  afterAll(async () => {
    await prisma.$executeRaw(Prisma.sql`DELETE FROM "StudioProject" WHERE "id"=${projectId}`);
    await prisma.$disconnect();
  });
  it('never accepts both concurrent USD 6 reservations against USD 10', async () => {
    const results = await Promise.allSettled([
      reserveStudioSpend(projectId,'concurrent-a',600),
      reserveStudioSpend(projectId,'concurrent-b',600)
    ]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const rows = await prisma.$queryRaw<Array<{ reservedCents: bigint }>>(Prisma.sql`
      SELECT "reservedCents" FROM "StudioProjectSpendBudget" WHERE "projectId"=${projectId}
    `);
    expect(rows[0]?.reservedCents).toBe(600n);
  });
  it('is idempotent and reconciles a charge', async () => {
    const first = await reserveStudioSpend(projectId,'idempotent-1',300);
    const again = await reserveStudioSpend(projectId,'idempotent-1',300);
    expect(again.reservationId).toBe(first.reservationId);
    expect(again.reused).toBe(true);
    await settleStudioSpend(projectId,first.reservationId,200);
    const rows = await prisma.$queryRaw<Array<{ confirmedCents: bigint; reservedCents: bigint }>>(Prisma.sql`
      SELECT "confirmedCents","reservedCents" FROM "StudioProjectSpendBudget" WHERE "projectId"=${projectId}
    `);
    expect(rows[0]?.confirmedCents).toBe(200n);
    expect(rows[0]?.reservedCents).toBe(600n);
  });
  it('releases only an active unbilled reservation', async () => {
    const reservation = await reserveStudioSpend(projectId,'release-1',200);
    await releaseUnbilledReservation(projectId,reservation.reservationId);
    await expect(releaseUnbilledReservation(projectId,reservation.reservationId)).rejects.toThrow('RESERVATION_NOT_ACTIVE');
  });
});
