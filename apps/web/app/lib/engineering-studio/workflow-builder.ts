import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

export type WorkflowDefinition = {
  name: string;
  description: string;
  projectId?: string | null;
  reusable: boolean;
  trigger: { type: 'EVENT'; eventType: string };
  actions: Array<{
    position: number;
    type: string;
    agentKey?: string | null;
    requiresApproval?: boolean;
    approvalGate?: string | null;
    config?: Record<string, unknown>;
  }>;
};

export async function createWorkflowDefinition(definition: WorkflowDefinition, actorUserId?: string) {
  const workflowId = randomUUID();
  const projectId = definition.reusable ? null : definition.projectId || null;
  const status = definition.reusable ? 'TEMPLATE' : 'PAUSED';

  await prisma.$transaction(async tx => {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioWorkflow" (
        "id","projectId","name","description","status","mode","priority","stopOnFailure",
        "maxExecutionsPerHour","createdByUserId","metaJson","createdAt","updatedAt"
      ) VALUES (
        ${workflowId},${projectId},${definition.name},${definition.description},${status},'EVENT',100,true,20,
        ${actorUserId || null},CAST(${JSON.stringify({ reusable: definition.reusable, builder: 'NATURAL_LANGUAGE_V1' })} AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
      )
    `);
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioWorkflowTrigger" (
        "id","workflowId","type","eventType","isEnabled","createdAt","updatedAt"
      ) VALUES (${randomUUID()},${workflowId},'EVENT',${definition.trigger.eventType},true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    `);
    for (const action of definition.actions) {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioWorkflowAction" (
          "id","workflowId","position","type","agentKey","configJson","requiresApproval","approvalGate","isEnabled","createdAt","updatedAt"
        ) VALUES (
          ${randomUUID()},${workflowId},${action.position},${action.type},${action.agentKey || null},
          CAST(${JSON.stringify(action.config || {})} AS jsonb),${Boolean(action.requiresApproval)},${action.approvalGate || null},true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
        )
      `);
    }
  });

  return { workflowId, status };
}

export async function cloneWorkflowTemplate(templateId: string, projectId: string, actorUserId?: string) {
  const rows = await prisma.$queryRaw<Array<{ name: string; description: string | null }>>(Prisma.sql`
    SELECT "name","description" FROM "StudioWorkflow" WHERE "id"=${templateId} AND "status"='TEMPLATE' LIMIT 1
  `);
  if (!rows[0]) throw new Error('Plantilla no encontrada.');
  const triggers = await prisma.$queryRaw<Array<{ eventType: string | null }>>(Prisma.sql`
    SELECT "eventType" FROM "StudioWorkflowTrigger" WHERE "workflowId"=${templateId} AND "isEnabled"=true ORDER BY "createdAt" ASC LIMIT 1
  `);
  const actions = await prisma.$queryRaw<Array<{ position: number; type: string; agentKey: string | null; configJson: unknown; requiresApproval: boolean; approvalGate: string | null }>>(Prisma.sql`
    SELECT "position","type","agentKey","configJson","requiresApproval","approvalGate"
    FROM "StudioWorkflowAction" WHERE "workflowId"=${templateId} AND "isEnabled"=true ORDER BY "position" ASC
  `);
  return createWorkflowDefinition({
    name: rows[0].name,
    description: rows[0].description || '',
    projectId,
    reusable: false,
    trigger: { type: 'EVENT', eventType: triggers[0]?.eventType || 'AGENT_RUN_COMPLETED' },
    actions: actions.map(a => ({ position: a.position, type: a.type, agentKey: a.agentKey, config: (a.configJson || {}) as Record<string, unknown>, requiresApproval: a.requiresApproval, approvalGate: a.approvalGate }))
  }, actorUserId);
}

export async function getWorkflowDetail(workflowId: string) {
  const workflow = await prisma.$queryRaw<Array<{ id: string; projectId: string | null; projectName: string | null; name: string; description: string | null; status: string; maxExecutionsPerHour: number }>>(Prisma.sql`
    SELECT w."id",w."projectId",p."name" AS "projectName",w."name",w."description",w."status",w."maxExecutionsPerHour"
    FROM "StudioWorkflow" w LEFT JOIN "StudioProject" p ON p."id"=w."projectId" WHERE w."id"=${workflowId} LIMIT 1
  `);
  if (!workflow[0]) return null;
  const [triggers, actions, runs] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string; type: string; eventType: string | null; isEnabled: boolean }>>(Prisma.sql`
      SELECT "id","type","eventType","isEnabled" FROM "StudioWorkflowTrigger" WHERE "workflowId"=${workflowId} ORDER BY "createdAt" ASC
    `),
    prisma.$queryRaw<Array<{ id: string; position: number; type: string; agentKey: string | null; requiresApproval: boolean; approvalGate: string | null; configJson: unknown }>>(Prisma.sql`
      SELECT "id","position","type","agentKey","requiresApproval","approvalGate","configJson"
      FROM "StudioWorkflowAction" WHERE "workflowId"=${workflowId} ORDER BY "position" ASC
    `),
    prisma.$queryRaw<Array<{ id: string; status: string; triggerType: string; startedAt: Date | null; finishedAt: Date | null; errorSummary: string | null; createdAt: Date }>>(Prisma.sql`
      SELECT "id","status","triggerType","startedAt","finishedAt","errorSummary","createdAt"
      FROM "StudioWorkflowRun" WHERE "workflowId"=${workflowId} ORDER BY "createdAt" DESC LIMIT 30
    `)
  ]);
  return { workflow: workflow[0], triggers, actions, runs };
}
