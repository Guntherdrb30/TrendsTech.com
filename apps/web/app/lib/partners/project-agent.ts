import { randomUUID } from 'node:crypto';
import { prisma } from '@trends172tech/db';
import {
  Agent,
  Runner,
  user,
  assistant,
  system,
  extractAllTextOutput,
  type AgentInputItem
} from '@trends172tech/openai';

type ProjectContextRow = {
  id: string;
  partnerId: string;
  name: string;
  targetCompany: string;
  clientContact: string | null;
  stage: string;
  objective: string | null;
  knownContext: string | null;
  requestedNeed: string | null;
  agentId: string | null;
  agentName: string | null;
  executiveSummary: string | null;
  currentStageSummary: string | null;
  confirmedFacts: unknown;
  assumptions: unknown;
  openQuestions: unknown;
  risks: unknown;
  nextActions: unknown;
  readinessScore: number;
};

type MemoryEntryRow = {
  category: string;
  content: string;
  sourceType: string;
  sourceLabel: string | null;
  confidence: string;
  createdAt: Date;
};

type AgentJson = {
  reply: string;
  executive_summary?: string;
  stage_summary?: string;
  readiness_score?: number;
  memory_updates?: Array<{
    category: 'FACT' | 'ASSUMPTION' | 'OPEN_QUESTION' | 'RISK' | 'NEXT_ACTION' | 'DECISION' | 'REQUIREMENT';
    content: string;
    confidence?: 'CONFIRMED' | 'RESEARCHED' | 'INFERRED' | 'WORKING_ASSUMPTION';
  }>;
  confirmed_facts?: string[];
  assumptions?: string[];
  open_questions?: string[];
  risks?: string[];
  next_actions?: string[];
};

function toStringList(value: unknown) {
  return Array.isArray(value) ? value.map(String).slice(0, 30) : [];
}

function clampReadiness(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function extractJson(text: string): AgentJson | null {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    const value = JSON.parse(cleaned) as AgentJson;
    if (value && typeof value.reply === 'string') return value;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        const value = JSON.parse(cleaned.slice(start, end + 1)) as AgentJson;
        if (value && typeof value.reply === 'string') return value;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function buildSystemPrompt(context: ProjectContextRow, memoryEntries: MemoryEntryRow[]) {
  const memory = memoryEntries
    .filter((entry) => !entry.category.startsWith('CHAT_'))
    .slice(0, 40)
    .map((entry) => ({
      category: entry.category,
      content: entry.content,
      confidence: entry.confidence,
      source: entry.sourceLabel || entry.sourceType
    }));

  const projectContext = {
    project: {
      id: context.id,
      name: context.name,
      targetCompany: context.targetCompany,
      clientContact: context.clientContact,
      stage: context.stage,
      objective: context.objective,
      knownContext: context.knownContext,
      requestedNeed: context.requestedNeed
    },
    memory: {
      executiveSummary: context.executiveSummary,
      currentStageSummary: context.currentStageSummary,
      confirmedFacts: toStringList(context.confirmedFacts),
      assumptions: toStringList(context.assumptions),
      openQuestions: toStringList(context.openQuestions),
      risks: toStringList(context.risks),
      nextActions: toStringList(context.nextActions),
      readinessScore: context.readinessScore,
      recentEntries: memory
    }
  };

  return [
    'Eres el Project Agent B2B de Trends172Tech para una sola oportunidad comercial.',
    'Tu memoria y alcance están estrictamente limitados al PROJECT_CONTEXT_JSON recibido.',
    'Actúa como asesor senior de alianzas B2B, levantamiento de información, estrategia comercial y prearquitectura de soluciones.',
    'Nunca inventes clientes, métricas, integraciones, costos, acuerdos, necesidades ni decisiones.',
    'Distingue explícitamente entre información confirmada, investigada, inferida y supuestos de trabajo.',
    'Si falta información crítica, formula preguntas concretas y priorizadas.',
    'No confirmes precio contractual, plazo definitivo ni alcance definitivo sin información suficiente y aprobación de Trends172Tech.',
    'Cuando el usuario aporte información nueva útil, proponla como memory_updates.',
    'La preparación (readiness_score) debe reflejar si existe información suficiente para la próxima fase comercial; no es probabilidad de cierre.',
    'Devuelve SIEMPRE JSON válido y sin markdown con esta forma:',
    '{"reply":"respuesta profesional","executive_summary":"resumen vivo opcional","stage_summary":"estado actual opcional","readiness_score":0,"memory_updates":[{"category":"FACT|ASSUMPTION|OPEN_QUESTION|RISK|NEXT_ACTION|DECISION|REQUIREMENT","content":"...","confidence":"CONFIRMED|RESEARCHED|INFERRED|WORKING_ASSUMPTION"}],"confirmed_facts":[],"assumptions":[],"open_questions":[],"risks":[],"next_actions":[]}',
    `PROJECT_CONTEXT_JSON:\n${JSON.stringify(projectContext)}`
  ].join('\n');
}

export async function runProjectAgent({
  partnerId,
  opportunityId,
  actorUserId,
  message
}: {
  partnerId: string;
  opportunityId: string;
  actorUserId: string;
  message: string;
}) {
  if (process.env.PARTNER_AGENT_API_ENABLED !== 'true') {
    return {
      ok: false as const,
      reply: 'El Project Agent está conectado, pero el consumo de IA está deshabilitado hasta que el administrador habilite PARTNER_AGENT_API_ENABLED.'
    };
  }

  const rows = await prisma.$queryRaw<ProjectContextRow[]>`
    SELECT
      o."id", o."partnerId", o."name", o."targetCompany", o."clientContact", o."stage", o."objective", o."knownContext", o."requestedNeed",
      a."id" AS "agentId", a."name" AS "agentName",
      m."executiveSummary", m."currentStageSummary", m."confirmedFacts", m."assumptions", m."openQuestions", m."risks", m."nextActions", COALESCE(m."readinessScore", 0) AS "readinessScore"
    FROM "PartnerOpportunity" o
    LEFT JOIN "ProjectAgent" a ON a."opportunityId" = o."id"
    LEFT JOIN "ProjectMemory" m ON m."opportunityId" = o."id"
    WHERE o."id" = ${opportunityId} AND o."partnerId" = ${partnerId}
    LIMIT 1
  `;
  const context = rows[0];
  if (!context) return { ok: false as const, reply: 'Proyecto no encontrado o sin acceso.' };

  const entries = await prisma.$queryRaw<MemoryEntryRow[]>`
    SELECT "category", "content", "sourceType", "sourceLabel", "confidence", "createdAt"
    FROM "ProjectMemoryEntry"
    WHERE "opportunityId" = ${opportunityId} AND "isCurrent" = true
    ORDER BY "createdAt" DESC
    LIMIT 80
  `;

  const chatHistory = entries
    .filter((entry) => entry.category === 'CHAT_USER' || entry.category === 'CHAT_AGENT')
    .slice(0, 12)
    .reverse();

  const input: AgentInputItem[] = [system(buildSystemPrompt(context, entries))];
  for (const entry of chatHistory) {
    input.push(entry.category === 'CHAT_USER' ? user(entry.content) : assistant(entry.content));
  }
  input.push(user(message));

  const agent = new Agent({
    name: context.agentName || `project_agent_${opportunityId}`,
    instructions: 'Sigue estrictamente las instrucciones del mensaje de sistema y devuelve JSON válido.',
    model: process.env.PARTNER_AGENT_MODEL || 'gpt-4.1-mini',
    modelSettings: { temperature: 0.4, maxTokens: 2200 }
  });
  const runner = new Runner({
    workflowName: 'partner_project_agent',
    groupId: opportunityId,
    traceIncludeSensitiveData: false,
    traceMetadata: {
      project_agent_id: context.agentId || '',
      opportunity_id: opportunityId,
      partner_id: partnerId
    }
  });

  const result = await runner.run(agent, input, { maxTurns: 4 });
  const raw = typeof result.finalOutput === 'string' ? result.finalOutput : extractAllTextOutput(result.newItems);
  const parsed = extractJson(raw || '');
  const reply = parsed?.reply?.trim() || raw?.trim() || 'No fue posible generar una respuesta.';
  const readiness = clampReadiness(parsed?.readiness_score, context.readinessScore || 0);
  const confirmedFacts = parsed?.confirmed_facts ?? toStringList(context.confirmedFacts);
  const assumptions = parsed?.assumptions ?? toStringList(context.assumptions);
  const openQuestions = parsed?.open_questions ?? toStringList(context.openQuestions);
  const risks = parsed?.risks ?? toStringList(context.risks);
  const nextActions = parsed?.next_actions ?? toStringList(context.nextActions);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "ProjectMemoryEntry" ("id","opportunityId","category","content","sourceType","sourceLabel","confidence","isCurrent","createdAt")
      VALUES (${randomUUID()}, ${opportunityId}, 'CHAT_USER', ${message}, 'ALLY_INPUT', 'Conversación con Project Agent', 'CONFIRMED', true, NOW())
    `;
    await tx.$executeRaw`
      INSERT INTO "ProjectMemoryEntry" ("id","opportunityId","category","content","sourceType","sourceLabel","confidence","isCurrent","createdAt")
      VALUES (${randomUUID()}, ${opportunityId}, 'CHAT_AGENT', ${reply}, 'AGENT_OUTPUT', 'Project Agent', 'INFERRED', true, NOW())
    `;

    for (const update of parsed?.memory_updates ?? []) {
      if (!update?.content?.trim()) continue;
      await tx.$executeRaw`
        INSERT INTO "ProjectMemoryEntry" ("id","opportunityId","category","content","sourceType","sourceLabel","confidence","isCurrent","createdAt")
        VALUES (${randomUUID()}, ${opportunityId}, ${update.category}, ${update.content.trim()}, 'AGENT_EXTRACTED', 'Project Agent', ${update.confidence || 'INFERRED'}, true, NOW())
      `;
    }

    await tx.$executeRaw`
      UPDATE "ProjectMemory"
      SET
        "executiveSummary" = COALESCE(${parsed?.executive_summary?.trim() || null}, "executiveSummary"),
        "currentStageSummary" = COALESCE(${parsed?.stage_summary?.trim() || null}, "currentStageSummary"),
        "confirmedFacts" = ${JSON.stringify(confirmedFacts)}::jsonb,
        "assumptions" = ${JSON.stringify(assumptions)}::jsonb,
        "openQuestions" = ${JSON.stringify(openQuestions)}::jsonb,
        "risks" = ${JSON.stringify(risks)}::jsonb,
        "nextActions" = ${JSON.stringify(nextActions)}::jsonb,
        "readinessScore" = ${readiness},
        "updatedAt" = NOW()
      WHERE "opportunityId" = ${opportunityId}
    `;
  });

  return { ok: true as const, reply, readinessScore: readiness, actorUserId };
}
