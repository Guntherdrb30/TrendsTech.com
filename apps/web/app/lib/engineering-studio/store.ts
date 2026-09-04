import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

export type StudioProjectListItem = {
  id: string;
  name: string;
  clientName: string | null;
  mode: string;
  stage: string;
  status: string;
  localAiRequired: boolean;
  createdAt: Date;
  blueprintStatus: string | null;
  forecastCost: Prisma.Decimal | null;
  contractedValue: Prisma.Decimal | null;
  forecastMargin: Prisma.Decimal | null;
};

export type StudioProjectDetail = {
  id: string;
  name: string;
  clientName: string | null;
  mode: string;
  stage: string;
  status: string;
  summary: string | null;
  mvpObjective: string | null;
  repositoryUrl: string | null;
  localAiRequired: boolean;
  createdAt: Date;
  blueprintId: string | null;
  blueprintVersion: number | null;
  blueprintStatus: string | null;
  understanding: string | null;
  architectureJson: unknown;
  risksJson: unknown;
  assumptionsJson: unknown;
  agentsJson: unknown;
  acceptanceCriteriaJson: unknown;
  estimatedInternalCost: Prisma.Decimal | null;
  recommendedPrice: Prisma.Decimal | null;
  estimatedOpexMonthly: Prisma.Decimal | null;
  approvalId: string | null;
  approvalStatus: string | null;
  approvalRequestedAt: Date | null;
};

export type CreateStudioProjectInput = {
  origin: 'idea' | 'prd' | 'chatgpt' | 'repository' | 'recovery';
  name: string;
  clientName?: string;
  summary: string;
  marginPercent: number;
  commercialBudget: number;
  localAiRequired: boolean;
  repositoryUrl?: string;
  createdByUserId?: string;
};

const originMode: Record<CreateStudioProjectInput['origin'], string> = {
  idea: 'CREATE',
  prd: 'CREATE',
  chatgpt: 'CREATE',
  repository: 'CONTINUE',
  recovery: 'RECOVER'
};

function preliminaryBlueprint(input: CreateStudioProjectInput) {
  const internalCost = Number((input.commercialBudget * (1 - input.marginPercent / 100)).toFixed(2));
  const architecture = [
    { area: 'Web App', detail: 'Next.js App Router · Admin privado' },
    { area: 'Dominio', detail: 'Project Service + Blueprint + Cost Engine' },
    { area: 'Datos', detail: 'Neon/Postgres · workspace aislado por proyecto' },
    { area: 'IA', detail: 'Astra director + especialistas bajo demanda' },
    { area: 'Integraciones', detail: 'GitHub · Vercel · OpenAI · Trends MCP' },
    { area: 'Seguridad', detail: 'ROOT · Approval Gates · Secrets Broker · Audit Log' }
  ];
  const assumptions = [
    'El MVP utilizará datos de prueba hasta autorizar el uso de datos reales.',
    'La primera fase no desplegará a producción automáticamente.'
  ];
  const risks = [
    'Cambios de alcance pueden alterar costo, margen y calendario.',
    'Integraciones externas y procesamiento IA pueden añadir OPEX.'
  ];
  const agents = [
    'Product Analyst',
    'Software Architect',
    'Frontend Engineer',
    'Backend Engineer',
    'Database Engineer',
    'QA Engineer',
    'Cybersecurity Engineer',
    ...(input.localAiRequired ? ['NVIDIA Local AI Architect'] : [])
  ];
  return { internalCost, architecture, assumptions, risks, agents };
}

export async function createStudioProject(input: CreateStudioProjectInput) {
  const projectId = randomUUID();
  const blueprintId = randomUUID();
  const forecastId = randomUUID();
  const approvalId = randomUUID();
  const eventId = randomUUID();
  const blueprint = preliminaryBlueprint(input);
  const clientName = input.clientName?.trim() || null;
  const repositoryUrl = input.repositoryUrl?.trim() || null;

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioProject" (
        "id", "name", "clientName", "mode", "stage", "status", "priority",
        "summary", "mvpObjective", "currency", "repositoryUrl", "localAiRequired",
        "createdByUserId", "createdAt", "updatedAt"
      ) VALUES (
        ${projectId}, ${input.name.trim()}, ${clientName}, ${originMode[input.origin]},
        'BLUEPRINT_READY', 'ACTIVE', 'MEDIUM', ${input.summary.trim()}, ${input.summary.trim()},
        'USD', ${repositoryUrl}, ${input.localAiRequired}, ${input.createdByUserId ?? null},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioBlueprint" (
        "id", "projectId", "version", "status", "understanding", "scopeJson",
        "assumptionsJson", "risksJson", "architectureJson", "agentsJson",
        "acceptanceCriteriaJson", "estimatedInternalCost", "recommendedPrice",
        "estimatedOpexMonthly", "createdAt", "updatedAt"
      ) VALUES (
        ${blueprintId}, ${projectId}, 1, 'READY', ${input.summary.trim()},
        CAST(${JSON.stringify({ origin: input.origin, mvp: input.summary.trim() })} AS jsonb),
        CAST(${JSON.stringify(blueprint.assumptions)} AS jsonb),
        CAST(${JSON.stringify(blueprint.risks)} AS jsonb),
        CAST(${JSON.stringify(blueprint.architecture)} AS jsonb),
        CAST(${JSON.stringify(blueprint.agents)} AS jsonb),
        CAST(${JSON.stringify(['Blueprint revisado', 'Presupuesto aprobado', 'Preview verificable antes de producción'])} AS jsonb),
        ${blueprint.internalCost}, ${input.commercialBudget}, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioBudgetForecast" (
        "id", "projectId", "internalCostForecast", "actualCost", "remainingCostForecast",
        "contractedValue", "potentialChangeValue", "forecastMarginPercent",
        "opexMonthlyForecast", "detailsJson", "calculatedAt", "createdAt"
      ) VALUES (
        ${forecastId}, ${projectId}, ${blueprint.internalCost}, 0, ${blueprint.internalCost},
        ${input.commercialBudget}, 0, ${input.marginPercent}, 0,
        CAST(${JSON.stringify({ kind: 'PRELIMINARY', note: 'Se recalculará con Cost Engine detallado.' })} AS jsonb),
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioApproval" (
        "id", "projectId", "gate", "status", "scopeJson", "requestedAt", "createdAt"
      ) VALUES (
        ${approvalId}, ${projectId}, 'BLUEPRINT', 'PENDING',
        CAST(${JSON.stringify({ blueprintId, version: 1 })} AS jsonb), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioEvent" (
        "id", "projectId", "type", "actorType", "actorRef", "message", "metaJson", "createdAt"
      ) VALUES (
        ${eventId}, ${projectId}, 'PROJECT_CREATED', 'USER', ${input.createdByUserId ?? null},
        'Proyecto y Blueprint preliminar creados.',
        CAST(${JSON.stringify({ origin: input.origin, blueprintId, approvalId })} AS jsonb), CURRENT_TIMESTAMP
      )
    `);
  });

  return { projectId, blueprintId, approvalId };
}

export async function listStudioProjects(): Promise<StudioProjectListItem[]> {
  return prisma.$queryRaw<StudioProjectListItem[]>(Prisma.sql`
    SELECT
      p."id", p."name", p."clientName", p."mode", p."stage", p."status",
      p."localAiRequired", p."createdAt",
      b."status" AS "blueprintStatus",
      f."internalCostForecast" AS "forecastCost",
      f."contractedValue" AS "contractedValue",
      f."forecastMarginPercent" AS "forecastMargin"
    FROM "StudioProject" p
    LEFT JOIN LATERAL (
      SELECT "status" FROM "StudioBlueprint"
      WHERE "projectId" = p."id"
      ORDER BY "version" DESC LIMIT 1
    ) b ON true
    LEFT JOIN LATERAL (
      SELECT "internalCostForecast", "contractedValue", "forecastMarginPercent"
      FROM "StudioBudgetForecast"
      WHERE "projectId" = p."id"
      ORDER BY "calculatedAt" DESC LIMIT 1
    ) f ON true
    ORDER BY p."createdAt" DESC
    LIMIT 100
  `);
}

export async function getStudioProjectDetail(projectId: string): Promise<StudioProjectDetail | null> {
  const rows = await prisma.$queryRaw<StudioProjectDetail[]>(Prisma.sql`
    SELECT
      p."id", p."name", p."clientName", p."mode", p."stage", p."status",
      p."summary", p."mvpObjective", p."repositoryUrl", p."localAiRequired", p."createdAt",
      b."id" AS "blueprintId", b."version" AS "blueprintVersion", b."status" AS "blueprintStatus",
      b."understanding", b."architectureJson", b."risksJson", b."assumptionsJson", b."agentsJson",
      b."acceptanceCriteriaJson", b."estimatedInternalCost", b."recommendedPrice", b."estimatedOpexMonthly",
      a."id" AS "approvalId", a."status" AS "approvalStatus", a."requestedAt" AS "approvalRequestedAt"
    FROM "StudioProject" p
    LEFT JOIN LATERAL (
      SELECT * FROM "StudioBlueprint"
      WHERE "projectId" = p."id"
      ORDER BY "version" DESC LIMIT 1
    ) b ON true
    LEFT JOIN LATERAL (
      SELECT * FROM "StudioApproval"
      WHERE "projectId" = p."id" AND "gate" = 'BLUEPRINT'
      ORDER BY "requestedAt" DESC LIMIT 1
    ) a ON true
    WHERE p."id" = ${projectId}
    LIMIT 1
  `);
  return rows[0] ?? null;
}
