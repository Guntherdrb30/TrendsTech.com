import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

export async function ensureDefaultProjectWorkflows(projectId: string, actorUserId?: string) {
  const existing = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS count FROM "StudioWorkflow" WHERE "projectId"=${projectId}
  `);
  if (Number(existing[0]?.count || 0) > 0) return { created: false };

  const runCompleted = randomUUID();
  const runFailed = randomUUID();
  const qaPassed = randomUUID();
  const deploymentReady = randomUUID();

  await prisma.$transaction(async tx => {
    const workflows = [
      {
        id: runCompleted,
        name: 'Agent Run Completed → QA + Context Refresh',
        description: 'Cuando un agente termina, refresca contexto y crea una tarea de QA antes de continuar.',
        eventType: 'AGENT_RUN_COMPLETED',
        actions: [
          { position: 1, type: 'BUILD_CONTEXT_PACK', agentKey: 'QA', config: {} },
          { position: 2, type: 'CREATE_BACKLOG_TASK', agentKey: 'QA', config: { title: 'QA del último Agent Run', priority: 'HIGH', source: 'WORKFLOW' } },
          { position: 3, type: 'RECORD_VAULT_NOTE', agentKey: null, config: { title: 'Run completado y enviado a QA' } }
        ]
      },
      {
        id: runFailed,
        name: 'Agent Run Failed → Pause + Human Review',
        description: 'Si un run falla, detiene la cadena automática y solicita revisión antes de reintentar.',
        eventType: 'AGENT_RUN_FAILED',
        actions: [
          { position: 1, type: 'PAUSE_PROJECT', agentKey: null, config: { reason: 'AGENT_RUN_FAILED' } },
          { position: 2, type: 'REQUEST_APPROVAL', agentKey: null, config: { gate: 'RUN_RECOVERY', note: 'Autorizar reintento o cambio de estrategia.' } },
          { position: 3, type: 'RECORD_VAULT_NOTE', agentKey: null, config: { title: 'Run fallido: revisión humana requerida' } }
        ]
      },
      {
        id: qaPassed,
        name: 'QA Passed → Prepare Next Engineering Task',
        description: 'Cuando QA aprueba, deja preparado el siguiente tramo sin saltarse Approval Gates.',
        eventType: 'QA_PASSED',
        actions: [
          { position: 1, type: 'BUILD_CONTEXT_PACK', agentKey: 'ORCHESTRATOR', config: {} },
          { position: 2, type: 'RECORD_VAULT_NOTE', agentKey: null, config: { title: 'QA aprobado; contexto actualizado' } }
        ]
      },
      {
        id: deploymentReady,
        name: 'Preview Ready → Human Review',
        description: 'Un preview listo no pasa a producción automáticamente: solicita revisión humana.',
        eventType: 'DEPLOYMENT_READY',
        actions: [
          { position: 1, type: 'REQUEST_APPROVAL', agentKey: null, config: { gate: 'PREVIEW_REVIEW', note: 'Revisar preview antes de merge o producción.' } },
          { position: 2, type: 'RECORD_VAULT_NOTE', agentKey: null, config: { title: 'Preview listo para revisión' } }
        ]
      }
    ];

    for (const wf of workflows) {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioWorkflow" ("id","projectId","name","description","status","mode","priority","stopOnFailure","maxExecutionsPerHour","createdByUserId","createdAt","updatedAt")
        VALUES (${wf.id},${projectId},${wf.name},${wf.description},'ACTIVE','EVENT',100,true,20,${actorUserId || null},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      `);
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioWorkflowTrigger" ("id","workflowId","type","eventType","isEnabled","createdAt","updatedAt")
        VALUES (${randomUUID()},${wf.id},'EVENT',${wf.eventType},true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      `);
      for (const action of wf.actions) {
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "StudioWorkflowAction" ("id","workflowId","position","type","agentKey","configJson","requiresApproval","isEnabled","createdAt","updatedAt")
          VALUES (${randomUUID()},${wf.id},${action.position},${action.type},${action.agentKey},CAST(${JSON.stringify(action.config)} AS jsonb),false,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        `);
      }
    }

    const watchers = [
      { name: 'Run bloqueado', kind: 'BLOCKED_RUN', severity: 'WARNING', condition: { statuses: ['BLOCKED_CONFIGURATION','BLOCKED_APPROVAL'], ageMinutes: 60 } },
      { name: 'Run fallido', kind: 'FAILED_RUN', severity: 'CRITICAL', condition: { statuses: ['FAILED'], ageMinutes: 0 } },
      { name: 'Aprobación pendiente', kind: 'PENDING_APPROVAL', severity: 'WARNING', condition: { ageMinutes: 60 } },
      { name: 'Presupuesto al 80%', kind: 'BUDGET_THRESHOLD', severity: 'CRITICAL', condition: { thresholdPercent: 80 } }
    ];
    for (const watcher of watchers) {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioWatcher" ("id","projectId","name","kind","status","severity","conditionJson","cooldownMinutes","notifyChannel","createdByUserId","createdAt","updatedAt")
        VALUES (${randomUUID()},${projectId},${watcher.name},${watcher.kind},'ACTIVE',${watcher.severity},CAST(${JSON.stringify(watcher.condition)} AS jsonb),60,'STUDIO',${actorUserId || null},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      `);
    }
  });

  return { created: true };
}
