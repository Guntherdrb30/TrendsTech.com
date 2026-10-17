import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

// This project-level opt-in is separate from OAuth scopes. OAuth proves who is
// connected; the opt-in authorizes storing ChatGPT memory for one Studio project.
const PROVIDER = 'CHATGPT_PROJECT_MEMORY';

type ConsentRow = { id: string; status: string; metaJson: unknown; updatedAt: Date };

export async function getProjectMemoryConsent(projectId: string) {
  const rows = await prisma.$queryRaw<ConsentRow[]>(Prisma.sql`
    SELECT "id", "status", "metaJson", "updatedAt"
    FROM "StudioIntegration"
    WHERE "projectId" = ${projectId} AND "provider" = ${PROVIDER}
    ORDER BY "updatedAt" DESC LIMIT 1
  `);
  const current = rows[0];
  return {
    projectId,
    enabled: current?.status === 'ACTIVE',
    updatedAt: current?.updatedAt ?? null,
    // Never expose actor identifiers or other internal metadata via MCP.
  };
}

export async function requireProjectMemoryConsent(projectId: string) {
  const consent = await getProjectMemoryConsent(projectId);
  if (!consent.enabled) {
    throw new Error('Este proyecto no tiene autorizacion para guardar memoria de ChatGPT. Solicita consentimiento explicito antes de escribir.');
  }
}

export async function setProjectMemoryConsent(
  projectId: string,
  enabled: boolean,
  actorRef: string
) {
  const projects = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "StudioProject" WHERE "id" = ${projectId} LIMIT 1
  `);
  if (!projects.length) throw new Error('Proyecto no encontrado.');

  const status = enabled ? 'ACTIVE' : 'DISABLED';
  await prisma.$transaction(async (tx) => {
    const existing = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "StudioIntegration"
      WHERE "projectId" = ${projectId} AND "provider" = ${PROVIDER}
      ORDER BY "updatedAt" DESC LIMIT 1 FOR UPDATE
    `);
    const meta = JSON.stringify({ source: 'CHATGPT', actorRef, recordedAt: new Date().toISOString() });
    if (existing[0]) {
      await tx.$executeRaw(Prisma.sql`
        UPDATE "StudioIntegration"
        SET "status" = ${status}, "metaJson" = CAST(${meta} AS jsonb),
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${existing[0].id}
      `);
    } else {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioIntegration"
        ("id", "projectId", "provider", "status", "metaJson", "createdAt", "updatedAt")
        VALUES (${randomUUID()}, ${projectId}, ${PROVIDER}, ${status},
          CAST(${meta} AS jsonb), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
    }
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioEvent"
        ("id", "projectId", "type", "actorType", "actorRef", "message", "metaJson", "createdAt")
      VALUES (${randomUUID()}, ${projectId}, ${enabled ? 'CHATGPT_MEMORY_APPROVED' : 'CHATGPT_MEMORY_REVOKED'},
        'USER', ${actorRef},
        ${enabled ? 'Guardado de memoria de ChatGPT autorizado para este proyecto.' : 'Guardado de memoria de ChatGPT revocado para este proyecto.'},
        CAST(${JSON.stringify({ provider: PROVIDER, enabled })} AS jsonb), CURRENT_TIMESTAMP)
    `);
  });
  return { projectId, enabled };
}
