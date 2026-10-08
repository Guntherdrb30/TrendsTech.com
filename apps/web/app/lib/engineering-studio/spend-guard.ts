import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

type ReservationRow = { id: string; estimatedCents: bigint; status: string };
function cents(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error('INVALID_AMOUNT');
  return BigInt(value);
}
/** Must be called before every billable provider invocation; missing project budget fails closed. */
export async function reserveStudioSpend(projectId: string, idempotencyKey: string, requestedCents: number) {
  const amount = cents(requestedCents);
  if (!projectId || !idempotencyKey || idempotencyKey.length > 200) throw new Error('INVALID_RESERVATION');
  return prisma.$transaction(async tx => {
    // Lock serializes reservations for the same project across workers.
    const budget = await tx.$queryRaw<Array<{ activeLimitCents: bigint; confirmedCents: bigint; reservedCents: bigint; paused: boolean }>>(Prisma.sql`
      SELECT "activeLimitCents", "confirmedCents", "reservedCents", "paused"
      FROM "StudioProjectSpendBudget" WHERE "projectId" = ${projectId} FOR UPDATE
    `);
    if (!budget[0] || budget[0].paused) throw new Error('BUDGET_PAUSED_OR_MISSING');
    const existing = await tx.$queryRaw<ReservationRow[]>(Prisma.sql`
      SELECT "id", "estimatedCents", "status" FROM "StudioSpendReservation"
      WHERE "projectId" = ${projectId} AND "idempotencyKey" = ${idempotencyKey}
    `);
    if (existing[0]) {
      if (existing[0].estimatedCents !== amount) throw new Error('IDEMPOTENCY_CONFLICT');
      return { reservationId: existing[0].id, status: existing[0].status, reused: true };
    }
    if (budget[0].confirmedCents + budget[0].reservedCents + amount > budget[0].activeLimitCents)
      throw new Error('BUDGET_EXCEEDED');
    const reservationId = randomUUID();
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioSpendReservation" ("id","projectId","idempotencyKey","estimatedCents")
      VALUES (${reservationId}, ${projectId}, ${idempotencyKey}, ${amount})
    `);
    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioProjectSpendBudget" SET "reservedCents" = "reservedCents" + ${amount}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "projectId" = ${projectId}
    `);
    return { reservationId, status: 'RESERVED', reused: false };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

/** Release only if provider confirms no charge; never silently release an in-flight request. */
export async function releaseUnbilledReservation(projectId: string, reservationId: string) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw(Prisma.sql`SELECT "projectId" FROM "StudioProjectSpendBudget" WHERE "projectId" = ${projectId} FOR UPDATE`);
    const rows = await tx.$queryRaw<ReservationRow[]>(Prisma.sql`
      SELECT "id","estimatedCents","status" FROM "StudioSpendReservation"
      WHERE "id" = ${reservationId} AND "projectId" = ${projectId} FOR UPDATE
    `);
    if (!rows[0] || rows[0].status !== 'RESERVED') throw new Error('RESERVATION_NOT_ACTIVE');
    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioSpendReservation" SET "status"='RELEASED',"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${reservationId}
    `);
    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioProjectSpendBudget" SET "reservedCents"="reservedCents"-${rows[0].estimatedCents},"updatedAt"=CURRENT_TIMESTAMP
      WHERE "projectId"=${projectId}
    `);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

/** Refuse a charge exceeding the reserved amount; requires manual reconciliation of overages. */
export async function settleStudioSpend(projectId: string, reservationId: string, actualCents: number) {
  if (!Number.isSafeInteger(actualCents) || actualCents < 0) throw new Error('INVALID_AMOUNT');
  const actual = BigInt(actualCents);
  return prisma.$transaction(async tx => {
    await tx.$queryRaw(Prisma.sql`SELECT "projectId" FROM "StudioProjectSpendBudget" WHERE "projectId"=${projectId} FOR UPDATE`);
    const rows = await tx.$queryRaw<ReservationRow[]>(Prisma.sql`
      SELECT "id","estimatedCents","status" FROM "StudioSpendReservation"
      WHERE "id"=${reservationId} AND "projectId"=${projectId} FOR UPDATE
    `);
    if (!rows[0] || rows[0].status !== 'RESERVED') throw new Error('RESERVATION_NOT_ACTIVE');
    if (actual > rows[0].estimatedCents) throw new Error('PROVIDER_OVERAGE_MANUAL_REVIEW');
    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioSpendReservation" SET "status"='SETTLED',"confirmedCents"=${actual},"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${reservationId}
    `);
    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioProjectSpendBudget" SET "reservedCents"="reservedCents"-${rows[0].estimatedCents},
      "confirmedCents"="confirmedCents"+${actual},"updatedAt"=CURRENT_TIMESTAMP WHERE "projectId"=${projectId}
    `);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

/**
 * Read-only snapshot for a project budget dashboard.
 * Do not treat a missing row as zero spend or permission to execute.
 */
export async function getStudioSpendSnapshot(projectId: string) {
  if (!projectId) throw new Error('INVALID_PROJECT');
  const rows = await prisma.$queryRaw<Array<{
    activeLimitCents: bigint;
    globalCeilingCents: bigint;
    confirmedCents: bigint;
    reservedCents: bigint;
    paused: boolean;
  }>>(Prisma.sql`
    SELECT "activeLimitCents","globalCeilingCents","confirmedCents","reservedCents","paused"
    FROM "StudioProjectSpendBudget" WHERE "projectId" = ${projectId}
  `);
  const budget = rows[0];
  if (!budget) return { configured: false as const, paused: true as const };
  const remainingCents = budget.activeLimitCents - budget.confirmedCents - budget.reservedCents;
  return {
    configured: true as const,
    paused: budget.paused,
    activeLimitCents: Number(budget.activeLimitCents),
    globalCeilingCents: Number(budget.globalCeilingCents),
    confirmedCents: Number(budget.confirmedCents),
    reservedCents: Number(budget.reservedCents),
    remainingCents: Number(remainingCents),
    canStartPaidRun: !budget.paused && remainingCents > 0n
  };
}
