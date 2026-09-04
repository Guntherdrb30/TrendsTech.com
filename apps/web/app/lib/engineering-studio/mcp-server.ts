import 'server-only';

import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Prisma, prisma } from '@trends172tech/db';
import { addVaultEntry, listVaultEntries, searchVault } from './vault';
import { buildContextPack } from './context-pack';
import { createStudioProject, getStudioProjectDetail, listStudioProjects } from './store';
import { approveBlueprintGate } from './approvals';

const vaultType = z.enum([
  'CONVERSATION_SUMMARY','PRD','REQUIREMENT','DECISION','ARCHITECTURE','CHANGE_REQUEST',
  'TASK','CODEX_RESULT','TEST_RESULT','DEPLOYMENT','ARTIFACT','NOTE'
]);

function textResult(payload: unknown, text: string) {
  return {
    content: [{ type: 'text' as const, text }],
    structuredContent: payload as Record<string, unknown>
  };
}

export function createTrendsMcpServer(actorRef = 'chatgpt-mcp') {
  const server = new McpServer({ name: 'trends-engineering-studio', version: '1.0.0' });

  server.registerTool('search', {
    title: 'Buscar proyectos de Engineering Studio',
    description: 'Use this when you need to find a Trends Engineering Studio project by name, client, stage, or status before fetching or changing it.',
    inputSchema: { query: z.string().min(1).max(200) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ query }) => {
    const projects = await listStudioProjects();
    const term = query.toLowerCase();
    const matches = projects.filter(project => [project.name, project.clientName || '', project.stage, project.status, project.mode]
      .some(value => value.toLowerCase().includes(term))).slice(0, 20);
    return textResult({ results: matches.map(project => ({ id: project.id, title: project.name, clientName: project.clientName, stage: project.stage, status: project.status })) }, `${matches.length} proyecto(s) encontrado(s).`);
  });

  server.registerTool('fetch', {
    title: 'Leer proyecto de Engineering Studio',
    description: 'Use this when you already have a project ID and need its current Blueprint, stage, repository, approval state, orchestration profile context, and recent Project Vault entries.',
    inputSchema: { id: z.string().uuid() },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ id }) => {
    const project = await getStudioProjectDetail(id);
    if (!project) throw new Error('Proyecto no encontrado.');
    const vault = await listVaultEntries(id, true);
    return textResult({ project, vault: vault.slice(0, 30) }, `Proyecto ${project.name} cargado con ${vault.length} entrada(s) vigentes en el Vault.`);
  });

  server.registerTool('studio_create_project', {
    title: 'Crear proyecto en Engineering Studio',
    description: 'Use this when the user has agreed to start a new software project and wants it persisted in Trends Engineering Studio with an initial Blueprint and Approval Gate.',
    inputSchema: {
      name: z.string().min(3).max(180),
      clientName: z.string().max(180).optional(),
      summary: z.string().min(20).max(20000),
      origin: z.enum(['idea','prd','chatgpt','repository','recovery']).default('chatgpt'),
      marginPercent: z.number().min(0).max(95).default(40),
      commercialBudget: z.number().min(0).default(0),
      localAiRequired: z.boolean().default(false),
      repositoryUrl: z.string().max(500).optional()
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false }
  }, async input => {
    const created = await createStudioProject({ ...input, createdByUserId: actorRef });
    await addVaultEntry({
      projectId: created.projectId,
      type: 'CONVERSATION_SUMMARY',
      title: 'Contexto inicial desde ChatGPT',
      content: input.summary,
      source: 'CHATGPT',
      sourceRef: actorRef,
      actorUserId: actorRef
    });
    return textResult(created, `Proyecto ${input.name} creado en Engineering Studio y contexto inicial guardado en Project Vault.`);
  });

  server.registerTool('studio_record_vault_entry', {
    title: 'Guardar conocimiento en Project Vault',
    description: 'Use this when a PRD, decision, requirement, architecture note, change request, task, result, artifact, or conversation summary should become persistent project knowledge.',
    inputSchema: {
      projectId: z.string().uuid(),
      type: vaultType,
      title: z.string().min(2).max(240),
      content: z.string().min(1).max(100000),
      supersedesId: z.string().uuid().optional(),
      sourceRef: z.string().max(500).optional()
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false }
  }, async input => {
    const result = await addVaultEntry({ ...input, source: 'CHATGPT', actorUserId: actorRef });
    return textResult(result, `${input.type} guardado en Project Vault como versión ${result.version}.`);
  });

  server.registerTool('studio_search_vault', {
    title: 'Buscar memoria de proyecto',
    description: 'Use this when you need to recover a previous decision, PRD detail, requirement, task, result, or note from a specific project.',
    inputSchema: { projectId: z.string().uuid(), query: z.string().min(1).max(300) },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ projectId, query }) => {
    const entries = await searchVault(projectId, query);
    return textResult({ entries }, `${entries.length} entrada(s) relevante(s) encontradas en Project Vault.`);
  });

  server.registerTool('studio_build_context_pack', {
    title: 'Generar Context Pack',
    description: 'Use this when Codex, Astra, NVIDIA Local AI Architect, frontend, backend, database, or QA needs a compact current project context before starting work.',
    inputSchema: {
      projectId: z.string().uuid(),
      agentKey: z.enum(['ORCHESTRATOR','FRONTEND','BACKEND','DATABASE','QA','NVIDIA']).default('ORCHESTRATOR')
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false }
  }, async ({ projectId, agentKey }) => {
    const result = await buildContextPack(projectId, agentKey, actorRef);
    return textResult(result as unknown as Record<string, unknown>, `Context Pack ${result.id} generado para ${agentKey}, ~${result.estimatedTokens} tokens estimados.`);
  });

  server.registerTool('studio_create_task', {
    title: 'Crear tarea de desarrollo',
    description: 'Use this when the user has decided that a concrete feature, fix, investigation, test, or implementation task should enter the Engineering Studio backlog.',
    inputSchema: {
      projectId: z.string().uuid(),
      title: z.string().min(3).max(240),
      description: z.string().min(1).max(20000),
      priority: z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).default('MEDIUM'),
      assignedAgentKey: z.string().max(120).optional(),
      acceptanceCriteria: z.array(z.string().min(1).max(1000)).max(30).default([])
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false }
  }, async input => {
    const id = randomUUID();
    await prisma.$transaction(async tx => {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioBacklogItem" (
          "id","projectId","title","description","status","priority","assignedAgentKey","estimatedCost","actualCost","acceptanceCriteriaJson","createdAt","updatedAt"
        ) VALUES (
          ${id},${input.projectId},${input.title},${input.description},'READY',${input.priority},${input.assignedAgentKey || null},0,0,
          CAST(${JSON.stringify(input.acceptanceCriteria)} AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
        )
      `);
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioEvent" ("id","projectId","type","actorType","actorRef","message","metaJson","createdAt")
        VALUES (${randomUUID()},${input.projectId},'BACKLOG_ITEM_CREATED','CHATGPT',${actorRef},${`Tarea: ${input.title}`},CAST(${JSON.stringify({ backlogItemId: id })} AS jsonb),CURRENT_TIMESTAMP)
      `);
    });
    await addVaultEntry({ projectId: input.projectId, type: 'TASK', title: input.title, content: input.description, source: 'CHATGPT', sourceRef: actorRef, actorUserId: actorRef, meta: { backlogItemId: id, acceptanceCriteria: input.acceptanceCriteria } });
    return textResult({ id }, `Tarea ${input.title} creada en el backlog y registrada en Project Vault.`);
  });

  server.registerTool('studio_approve_blueprint', {
    title: 'Aprobar Blueprint y Baseline',
    description: 'Use this only when the user explicitly approves the current Blueprint. This freezes Baseline v1 and unlocks the supervised execution phase. It does not deploy to production.',
    inputSchema: { projectId: z.string().uuid(), confirm: z.literal(true) },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: true }
  }, async ({ projectId }) => {
    const result = await approveBlueprintGate(projectId, actorRef);
    return textResult(result as unknown as Record<string, unknown>, result.alreadyApproved ? 'Blueprint ya estaba aprobado.' : 'Blueprint aprobado y Baseline v1 congelado.');
  });

  return server;
}
