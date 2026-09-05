import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

export async function approveBlueprintGate(projectId: string, actorUserId: string) {
  return prisma.$transaction(async (tx) => {
    const approvals = await tx.$queryRaw<Array<{ id: string; status: string }>>(Prisma.sql`
      SELECT "id", "status"
      FROM "StudioApproval"
      WHERE "projectId" = ${projectId} AND "gate" = 'BLUEPRINT'
      ORDER BY "requestedAt" DESC
      LIMIT 1
      FOR UPDATE
    `);
    const approval = approvals[0];
    if (!approval) throw new Error('No existe Approval Gate A para este proyecto.');
    if (approval.status === 'APPROVED') return { alreadyApproved: true };

    const blueprints = await tx.$queryRaw<Array<{
      id: string;
      version: number;
      estimatedInternalCost: Prisma.Decimal;
      recommendedPrice: Prisma.Decimal;
      estimatedOpexMonthly: Prisma.Decimal;
    }>>(Prisma.sql`
      SELECT "id", "version", "estimatedInternalCost", "recommendedPrice", "estimatedOpexMonthly"
      FROM "StudioBlueprint"
      WHERE "projectId" = ${projectId}
      ORDER BY "version" DESC
      LIMIT 1
      FOR UPDATE
    `);
    const blueprint = blueprints[0];
    if (!blueprint) throw new Error('El proyecto no tiene Blueprint para aprobar.');

    const forecasts = await tx.$queryRaw<Array<{
      forecastMarginPercent: Prisma.Decimal;
      detailsJson: unknown;
    }>>(Prisma.sql`
      SELECT "forecastMarginPercent", "detailsJson"
      FROM "StudioBudgetForecast"
      WHERE "projectId" = ${projectId}
      ORDER BY "calculatedAt" DESC
      LIMIT 1
    `);
    const forecast = forecasts[0];

    const baselineId = randomUUID();
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioBudgetBaseline" (
        "id", "projectId", "version", "internalCost", "commercialValue",
        "targetMarginPercent", "contingencyPercent", "overheadPercent", "opexMonthly",
        "detailsJson", "approvedAt", "approvedByUserId", "createdAt"
      ) VALUES (
        ${baselineId}, ${projectId}, 1, ${blueprint.estimatedInternalCost}, ${blueprint.recommendedPrice},
        ${forecast?.forecastMarginPercent ?? new Prisma.Decimal(0)}, 0, 0, ${blueprint.estimatedOpexMonthly},
        CAST(${JSON.stringify({ blueprintId: blueprint.id, blueprintVersion: blueprint.version, source: 'GATE_A' })} AS jsonb),
        CURRENT_TIMESTAMP, ${actorUserId}, CURRENT_TIMESTAMP
      )
      ON CONFLICT ("projectId", "version") DO NOTHING
    `);

    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioApproval"
      SET "status" = 'APPROVED', "decidedAt" = CURRENT_TIMESTAMP, "decidedByUserId" = ${actorUserId},
          "decisionNote" = 'Blueprint y Baseline v1 aprobados.'
      WHERE "id" = ${approval.id}
    `);

    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioBlueprint"
      SET "status" = 'APPROVED', "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${blueprint.id}
    `);

    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioProject"
      SET "stage" = 'BLUEPRINT_APPROVED', "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${projectId}
    `);

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioEvent" (
        "id", "projectId", "type", "actorType", "actorRef", "message", "metaJson", "createdAt"
      ) VALUES (
        ${randomUUID()}, ${projectId}, 'BLUEPRINT_APPROVED', 'USER', ${actorUserId},
        'Approval Gate A aprobado. Baseline v1 congelado.',
        CAST(${JSON.stringify({ blueprintId: blueprint.id, baselineId })} AS jsonb), CURRENT_TIMESTAMP
      )
    `);

    return { alreadyApproved: false, baselineId };
  });
}
