import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

export type OrchestrationProfile = 'ECONOMY' | 'STANDARD' | 'ASTRA';

export type RoutingPolicy = {
  defaultProfile: OrchestrationProfile;
  allowAutomaticAstraEscalation: boolean;
  requireApprovalForAstra: boolean;
  economyLabel: string;
  standardLabel: string;
  astraLabel: string;
};

export const DEFAULT_ROUTING_POLICY: RoutingPolicy = {
  defaultProfile: 'STANDARD',
  allowAutomaticAstraEscalation: false,
  requireApprovalForAstra: true,
  economyLabel: 'Económico',
  standardLabel: 'Estándar',
  astraLabel: 'Astra / Alta complejidad'
};

function normalizeProfile(value: unknown): OrchestrationProfile {
  return value === 'ECONOMY' || value === 'ASTRA' ? value : 'STANDARD';
}

export async function getGlobalRoutingPolicy(): Promise<RoutingPolicy> {
  const rows = await prisma.$queryRaw<Array<{ metaJson: unknown }>>(Prisma.sql`
    SELECT "metaJson"
    FROM "StudioIntegration"
    WHERE "projectId" IS NULL AND "provider" = 'STUDIO_ROUTING_CONFIG'
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `);
  const raw = (rows[0]?.metaJson ?? {}) as Partial<RoutingPolicy>;
  return {
    ...DEFAULT_ROUTING_POLICY,
    ...raw,
    defaultProfile: normalizeProfile(raw.defaultProfile)
  };
}

export async function saveGlobalRoutingPolicy(policy: RoutingPolicy) {
  const existing = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id"
    FROM "StudioIntegration"
    WHERE "projectId" IS NULL AND "provider" = 'STUDIO_ROUTING_CONFIG'
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `);
  const meta = JSON.stringify(policy);
  if (existing[0]) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioIntegration"
      SET "status" = 'ACTIVE', "metaJson" = CAST(${meta} AS jsonb), "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${existing[0].id}
    `);
    return;
  }
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "StudioIntegration" (
      "id", "projectId", "provider", "status", "metaJson", "createdAt", "updatedAt"
    ) VALUES (
      ${randomUUID()}, NULL, 'STUDIO_ROUTING_CONFIG', 'ACTIVE', CAST(${meta} AS jsonb), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
  `);
}

export async function saveProjectRoutingPolicy(projectId: string, profile: OrchestrationProfile, actorRef?: string) {
  const global = await getGlobalRoutingPolicy();
  const policy = {
    profile,
    requireApprovalForAstra: global.requireApprovalForAstra,
    allowAutomaticAstraEscalation: false,
    actorRef: actorRef ?? null
  };
  const existing = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id"
    FROM "StudioIntegration"
    WHERE "projectId" = ${projectId} AND "provider" = 'ORCHESTRATION_POLICY'
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `);
  if (existing[0]) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioIntegration"
      SET "status" = 'ACTIVE', "metaJson" = CAST(${JSON.stringify(policy)} AS jsonb), "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${existing[0].id}
    `);
  } else {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "StudioIntegration" (
        "id", "projectId", "provider", "status", "metaJson", "createdAt", "updatedAt"
      ) VALUES (
        ${randomUUID()}, ${projectId}, 'ORCHESTRATION_POLICY', 'ACTIVE', CAST(${JSON.stringify(policy)} AS jsonb), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);
  }
}

export async function getProjectRoutingProfile(projectId: string): Promise<OrchestrationProfile> {
  const rows = await prisma.$queryRaw<Array<{ metaJson: unknown }>>(Prisma.sql`
    SELECT "metaJson"
    FROM "StudioIntegration"
    WHERE "projectId" = ${projectId} AND "provider" = 'ORCHESTRATION_POLICY'
    ORDER BY "updatedAt" DESC
    LIMIT 1
  `);
  const raw = (rows[0]?.metaJson ?? {}) as { profile?: unknown };
  if (raw.profile) return normalizeProfile(raw.profile);
  return (await getGlobalRoutingPolicy()).defaultProfile;
}
