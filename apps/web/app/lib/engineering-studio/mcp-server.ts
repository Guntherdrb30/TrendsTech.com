import 'server-only';

import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Prisma, prisma } from '@trends172tech/db';
import { addVaultEntry, listVaultEntries, searchVault } from './vault';
import { buildContextPack } from './context-pack';
import { createStudioProject, getStudioProjectDetail, listStudioProjects } from './store';
import { approveBlueprintGate } from './approvals';
import { workflowDefinitionSchema } from './workflow-contract';
import { listAgentRuns, prepareAgentRun } from './agent-runner';
import { getProjectRoutingProfile, saveProjectRoutingPolicy } from './routing';

const vaultType = z.enum([
  'CONVERSATION_SUMMARY','PRD','REQUIREMENT','DECISION','ARCHITECTURE','CHANGE_REQUEST',
  'TASK','CODEX_RESULT','TEST_RESULT','DEPLOYMENT','ARTIFACT','NOTE'
]);

export const STUDIO_READ_TOOLS = [
  'studio_search_projects',
  'studio_fetch_project',
  'studio_search_vault',
  'studio_list_agent_runs',
  'studio_get_routing_profile',
  'studio_validate_workflow_draft'
] as const;

export const STUDIO_WRITE_TOOLS = [
  'studio_create_project',
  'studio_record_vault_entry',
  'studio_build_context_pack',
  'studio_create_task',
  'studio_set_routing_profile',
  'studio_approve_blueprint'
] as const;

export const STUDIO_EXECUTE_TOOLS = [
  'studio_prepare_agent_run'
] as const;

export type StudioToolName =
  | (typeof STUDIO_READ_TOOLS)[number]
  | (typeof STUDIO_WRITE_TOOLS)[number]
  | (typeof STUDIO_EXECUTE_TOOLS)[number];

function textResult(payload: unknown, text: string) {
  return { content: [{ type: 'text' as const, text }], structuredContent: payload as Record<string, unknown> };
}

function canRegister(allowedTools: Set<string> | null, name: StudioToolName) {
  return allowedTools === null || allowedTools.has(name);
}

export function registerEngineeringStudioTools(
  server: McpServer,
  actorRef = 'chatgpt-mcp',
  allowedTools: Set<string> | null = null
) {
  if (canRegister(allowedTools, 'studio_search_projects')) {
    server.registerTool('studio_search_projects', { title:'Buscar proyectos de Engineering Studio', description:'Find a Trends Engineering Studio project by name, client, stage, or status.', inputSchema:{query:z.string().min(1).max(200)}, annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false} }, async ({query})=>{
      const projects=await listStudioProjects(); const term=query.toLowerCase();
      const matches=projects.filter(project=>[project.name,project.clientName||'',project.stage,project.status,project.mode].some(value=>value.toLowerCase().includes(term))).slice(0,20);
      return textResult({results:matches.map(project=>({id:project.id,title:project.name,clientName:project.clientName,stage:project.stage,status:project.status}))},`${matches.length} proyecto(s) encontrado(s).`);
    });
  }

  if (canRegister(allowedTools, 'studio_fetch_project')) {
    server.registerTool('studio_fetch_project', { title:'Leer proyecto de Engineering Studio', description:'Load current Blueprint, stage, repository, approval state and recent Project Vault entries.', inputSchema:{id:z.string().uuid()}, annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false} }, async ({id})=>{
      const project=await getStudioProjectDetail(id); if(!project) throw new Error('Proyecto no encontrado.'); const vault=await listVaultEntries(id,true);
      return textResult({project,vault:vault.slice(0,30)},`Proyecto ${project.name} cargado con ${vault.length} entrada(s) vigentes en el Vault.`);
    });
  }

  if (canRegister(allowedTools, 'studio_create_project')) {
    server.registerTool('studio_create_project', { title:'Crear proyecto en Engineering Studio', description:'Persist a new software project with initial Blueprint and Approval Gate.', inputSchema:{name:z.string().min(3).max(180),clientName:z.string().max(180).optional(),summary:z.string().min(20).max(20000),origin:z.enum(['idea','prd','chatgpt','repository','recovery']).default('chatgpt'),marginPercent:z.number().min(0).max(95).default(40),commercialBudget:z.number().min(0).default(0),localAiRequired:z.boolean().default(false),repositoryUrl:z.string().max(500).optional()}, annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false} }, async input=>{
      const created=await createStudioProject({...input,createdByUserId:actorRef}); await addVaultEntry({projectId:created.projectId,type:'CONVERSATION_SUMMARY',title:'Contexto inicial desde ChatGPT',content:input.summary,source:'CHATGPT',sourceRef:actorRef,actorUserId:actorRef}); return textResult(created,`Proyecto ${input.name} creado en Engineering Studio.`);
    });
  }

  if (canRegister(allowedTools, 'studio_record_vault_entry')) {
    server.registerTool('studio_record_vault_entry',{title:'Guardar conocimiento en Project Vault',description:'Persist project knowledge.',inputSchema:{projectId:z.string().uuid(),type:vaultType,title:z.string().min(2).max(240),content:z.string().min(1).max(100000),supersedesId:z.string().uuid().optional(),sourceRef:z.string().max(500).optional()},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false}},async input=>{const result=await addVaultEntry({...input,source:'CHATGPT',actorUserId:actorRef});return textResult(result,`${input.type} guardado en Project Vault como versión ${result.version}.`);});
  }

  if (canRegister(allowedTools, 'studio_search_vault')) {
    server.registerTool('studio_search_vault',{title:'Buscar memoria de proyecto',description:'Recover project decisions and context.',inputSchema:{projectId:z.string().uuid(),query:z.string().min(1).max(300)},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async({projectId,query})=>{const entries=await searchVault(projectId,query);return textResult({entries},`${entries.length} entrada(s) encontradas.`);});
  }

  if (canRegister(allowedTools, 'studio_build_context_pack')) {
    server.registerTool('studio_build_context_pack',{title:'Generar Context Pack',description:'Build compact current context for an engineering agent.',inputSchema:{projectId:z.string().uuid(),agentKey:z.enum(['ORCHESTRATOR','FRONTEND','BACKEND','DATABASE','QA','NVIDIA']).default('ORCHESTRATOR')},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false}},async({projectId,agentKey})=>{const result=await buildContextPack(projectId,agentKey,actorRef);return textResult(result as unknown as Record<string,unknown>,`Context Pack ${result.id} generado.`);});
  }

  if (canRegister(allowedTools, 'studio_create_task')) {
    server.registerTool('studio_create_task',{title:'Crear tarea de desarrollo',description:'Create an approved development backlog task.',inputSchema:{projectId:z.string().uuid(),title:z.string().min(3).max(240),description:z.string().min(1).max(20000),priority:z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).default('MEDIUM'),assignedAgentKey:z.string().max(120).optional(),acceptanceCriteria:z.array(z.string().min(1).max(1000)).max(30).default([])},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false}},async input=>{
      const id=randomUUID();
      await prisma.$transaction(async tx=>{
        await tx.$executeRaw(Prisma.sql`INSERT INTO "StudioBacklogItem" ("id","projectId","title","description","status","priority","assignedAgentKey","estimatedCost","actualCost","acceptanceCriteriaJson","createdAt","updatedAt") VALUES (${id},${input.projectId},${input.title},${input.description},'READY',${input.priority},${input.assignedAgentKey||null},0,0,CAST(${JSON.stringify(input.acceptanceCriteria)} AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
        await tx.$executeRaw(Prisma.sql`INSERT INTO "StudioEvent" ("id","projectId","type","actorType","actorRef","message","metaJson","createdAt") VALUES (${randomUUID()},${input.projectId},'BACKLOG_ITEM_CREATED','CHATGPT',${actorRef},${`Tarea: ${input.title}`},CAST(${JSON.stringify({backlogItemId:id})} AS jsonb),CURRENT_TIMESTAMP)`);
      });
      await addVaultEntry({projectId:input.projectId,type:'TASK',title:input.title,content:input.description,source:'CHATGPT',sourceRef:actorRef,actorUserId:actorRef,meta:{backlogItemId:id,acceptanceCriteria:input.acceptanceCriteria}});
      return textResult({id},`Tarea ${input.title} creada.`);
    });
  }

  if (canRegister(allowedTools, 'studio_validate_workflow_draft')) {
    server.registerTool('studio_validate_workflow_draft',{
      title:'Interpretar y validar borrador de workflow',
      description:'Use this when the user describes a software workflow in natural language. Convert the request into the provided strict workflowDefinition schema and return it here for validation. This tool NEVER activates or executes the workflow and never consumes a paid model by itself.',
      inputSchema:{naturalLanguage:z.string().min(10).max(20000),definition:workflowDefinitionSchema,interpretationChannel:z.enum(['CHATGPT_MCP','CODEX_CHATGPT_AUTH']).default('CHATGPT_MCP')},
      annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false,idempotentHint:true}
    },async({naturalLanguage,definition,interpretationChannel})=>{
      const parsed=workflowDefinitionSchema.safeParse(definition);
      if(!parsed.success) throw new Error(`Workflow inválido: ${parsed.error.issues.map(issue=>issue.message).join('; ')}`);
      return textResult({valid:true,channel:interpretationChannel,naturalLanguage,definition:parsed.data,safety:{activated:false,executed:false,production:false,paidApiStarted:false}},`Borrador ${parsed.data.name} validado. No fue activado ni ejecutado.`);
    });
  }

  if (canRegister(allowedTools, 'studio_approve_blueprint')) {
    server.registerTool('studio_approve_blueprint',{title:'Aprobar Blueprint y Baseline',description:'Use only after explicit user approval.',inputSchema:{projectId:z.string().uuid(),confirm:z.literal(true)},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:true}},async({projectId})=>{const result=await approveBlueprintGate(projectId,actorRef);return textResult(result as unknown as Record<string,unknown>,result.alreadyApproved?'Blueprint ya estaba aprobado.':'Blueprint aprobado y Baseline v1 congelado.');});
  }

  if (canRegister(allowedTools, 'studio_get_routing_profile')) {
    server.registerTool('studio_get_routing_profile',{title:'Consultar perfil de orquestación',description:'Read the current Engineering Studio routing profile for a project.',inputSchema:{projectId:z.string().uuid()},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false,idempotentHint:true}},async({projectId})=>{
      const profile=await getProjectRoutingProfile(projectId);
      return textResult({projectId,profile},`Perfil de orquestación actual: ${profile}.`);
    });
  }

  if (canRegister(allowedTools, 'studio_set_routing_profile')) {
    server.registerTool('studio_set_routing_profile',{title:'Configurar perfil de orquestación',description:'Set ECONOMY, STANDARD, or ASTRA routing for a project. This does not start a paid model execution.',inputSchema:{projectId:z.string().uuid(),profile:z.enum(['ECONOMY','STANDARD','ASTRA'])},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:true}},async({projectId,profile})=>{
      await saveProjectRoutingPolicy(projectId,profile,actorRef);
      return textResult({projectId,profile,safety:{paidModelExecutionStarted:false}},`Perfil ${profile} configurado. No se inició ninguna ejecución de modelo.`);
    });
  }

  if (canRegister(allowedTools, 'studio_list_agent_runs')) {
    server.registerTool('studio_list_agent_runs',{title:'Listar ejecuciones de agentes',description:'List recent Engineering Studio agent runs and their current status.',inputSchema:{projectId:z.string().uuid().optional()},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false,idempotentHint:true}},async({projectId})=>{
      const runs=await listAgentRuns();
      const filtered=projectId?runs.filter(run=>run.projectId===projectId):runs;
      return textResult({runs:filtered.slice(0,50)},`${filtered.length} ejecución(es) encontrada(s).`);
    });
  }

  if (canRegister(allowedTools, 'studio_prepare_agent_run')) {
    server.registerTool('studio_prepare_agent_run',{title:'Preparar ejecución supervisada',description:'Prepare an Engineering Studio agent run on a dedicated GitHub branch. This does not execute a paid model, merge to main, or deploy to production.',inputSchema:{projectId:z.string().uuid(),task:z.string().min(20).max(20000),confirm:z.literal(true)},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:true,idempotentHint:false}},async({projectId,task})=>{
      const result=await prepareAgentRun(projectId,actorRef,task);
      return textResult({...result,safety:{paidModelExecutionStarted:false,mergeToMain:false,productionDeploy:false}},`Ejecución ${result.runId} preparada en ${result.status}. No se inició un modelo de pago ni se desplegó a producción.`);
    });
  }
}

export function createTrendsMcpServer(actorRef = 'chatgpt-mcp') {
  const server = new McpServer({ name: 'trends-engineering-studio', version: '1.1.0' });
  registerEngineeringStudioTools(server, actorRef, null);
  return server;
}
