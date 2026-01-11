import { prisma, Prisma } from '@trends172tech/db';
import {
  createBaseAgent,
  getBaseAgentDefinition,
  getAgentTools,
  getOpenAIRequestId,
  TOOL_NAMES,
  Runner,
  user,
  assistant,
  system,
  extractAllTextOutput,
  type AgentInputItem,
  type ToolContext
} from '@trends172tech/openai';
import { buildContext } from './contextBuilder';
import type { OrchestratorRequest, OrchestratorResponse } from './types';

const FALLBACK_REPLY = 'En este momento no puedo ayudarte. Deseas que un asesor humano te contacte?';
const TOKEN_COST_PER_MESSAGE = 1;

function sanitizeContextPayload(payload: unknown) {
  const json = JSON.stringify(payload);
  return json.length > 4000 ? `${json.slice(0, 4000)}...` : json;
}

async function loadConversationHistory(tenantId: string, agentInstanceId: string, sessionId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      action: 'openai_message',
      entity: 'agent_instance',
      entityId: agentInstanceId,
      metaJson: { path: ['sessionId'], equals: sessionId }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  const ordered = logs.reverse();
  const history: AgentInputItem[] = [];
  for (const log of ordered) {
    if (!log.metaJson || typeof log.metaJson !== 'object') {
      continue;
    }
    const meta = log.metaJson as { userMessage?: string; reply?: string };
    if (meta.userMessage) {
      history.push(user(meta.userMessage));
    }
    if (meta.reply) {
      history.push(assistant(meta.reply));
    }
  }

  return history;
}

async function getPlanLimits(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: 'ACTIVE' },
    orderBy: { startedAt: 'desc' },
    include: { plan: true }
  });

  const limits = (subscription?.plan?.limitsJson ?? {}) as {
    allowedTools?: string[];
    maxMessagesPerMonth?: number;
  };

  return {
    allowedTools: limits.allowedTools ?? TOOL_NAMES,
    maxMessagesPerMonth: limits.maxMessagesPerMonth
  };
}

async function ensureTokenWallet(tenantId: string, defaultBalance?: number) {
  const existing = await prisma.tokenWallet.findUnique({
    where: { tenantId }
  });

  if (existing) {
    return existing;
  }

  return prisma.tokenWallet.create({
    data: {
      tenantId,
      balance: defaultBalance ?? 0
    }
  });
}

async function logUsage({
  tenantId,
  actorUserId,
  agentInstanceId,
  sessionId,
  model,
  toolCalls,
  messages
}: {
  tenantId: string;
  actorUserId: string;
  agentInstanceId: string;
  sessionId: string;
  model?: string | null;
  toolCalls: number;
  messages: number;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId,
      tenantId,
      action: 'openai_usage',
      entity: 'agent_instance',
      entityId: agentInstanceId,
      metaJson: { sessionId, model, toolCalls, messages }
    }
  });
}

async function logConversation({
  tenantId,
  actorUserId,
  agentInstanceId,
  sessionId,
  userMessage,
  reply,
  baseAgentKey,
  toolCalls
}: {
  tenantId: string;
  actorUserId: string;
  agentInstanceId: string;
  sessionId: string;
  userMessage: string;
  reply: string;
  baseAgentKey: string;
  toolCalls: number;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId,
      tenantId,
      action: 'openai_message',
      entity: 'agent_instance',
      entityId: agentInstanceId,
      metaJson: { sessionId, userMessage, reply, baseAgentKey, toolCalls }
    }
  });
}

function countToolCalls(items: { type: string }[]) {
  return items.filter((item) => item.type === 'tool_call_item').length;
}

export async function runOrchestrator(
  request: OrchestratorRequest,
  actorUserId: string,
  tenantId: string
): Promise<OrchestratorResponse> {
  try {
    const agentInstance = await prisma.agentInstance.findFirst({
      where: { id: request.agentInstanceId, tenantId }
    });

    if (!agentInstance) {
      return { reply: 'Agent instance not found.' };
    }

    const planLimits = await getPlanLimits(tenantId);
    const wallet = await ensureTokenWallet(tenantId, planLimits.maxMessagesPerMonth);

    if (wallet.balance < TOKEN_COST_PER_MESSAGE) {
      return { reply: 'Saldo de tokens insuficiente. Recarga tokens para continuar.' };
    }

    const baseAgentDefinition = getBaseAgentDefinition(agentInstance.baseAgentKey);
    const contextPayload = await buildContext({
      tenantId,
      agentInstanceId: agentInstance.id,
      sessionId: request.sessionId,
      channel: request.channel,
      endUser: request.endUser,
      userMessage: request.message
    });

    const contextString = sanitizeContextPayload(contextPayload);
    const history = await loadConversationHistory(tenantId, agentInstance.id, request.sessionId);
    const inputItems: AgentInputItem[] = [
      system(`CONTEXT_JSON:\n${contextString}`),
      ...history,
      user(request.message)
    ];

    const toolContext: ToolContext = {
      tenantId,
      agentInstanceId: agentInstance.id,
      actorUserId,
      sessionId: request.sessionId
    };
    const tools = getAgentTools(toolContext, planLimits.allowedTools);
    const agent = createBaseAgent(agentInstance.baseAgentKey, tools);
    const runner = new Runner({
      workflowName: baseAgentDefinition.name,
      groupId: request.sessionId,
      traceIncludeSensitiveData: false,
      traceMetadata: {
        workflow_id: baseAgentDefinition.workflowId ?? '',
        base_agent_key: agentInstance.baseAgentKey,
        session_id: request.sessionId,
        tenant_id: tenantId
      }
    });

    const result = await runner.run(agent, inputItems, { maxTurns: 6 });
    const toolCallsExecuted = countToolCalls(result.newItems);
    const replyText =
      (typeof result.finalOutput === 'string' ? result.finalOutput : extractAllTextOutput(result.newItems)) ||
      FALLBACK_REPLY;
    const modelName = typeof agent.model === 'string' ? agent.model : baseAgentDefinition.model ?? null;

    const endUserJson = request.endUser ?? Prisma.DbNull;

    await prisma.agentSession.upsert({
      where: { tenantId_sessionId: { tenantId, sessionId: request.sessionId } },
      update: {
        agentInstanceId: agentInstance.id,
        channel: request.channel ?? 'web',
        endUserJson
      },
      create: {
        tenantId,
        agentInstanceId: agentInstance.id,
        sessionId: request.sessionId,
        channel: request.channel ?? 'web',
        endUserJson,
        isDemo: false
      }
    });

    await logConversation({
      tenantId,
      actorUserId,
      agentInstanceId: agentInstance.id,
      sessionId: request.sessionId,
      userMessage: request.message,
      reply: replyText,
      baseAgentKey: agentInstance.baseAgentKey,
      toolCalls: toolCallsExecuted
    });

    await logUsage({
      tenantId,
      actorUserId,
      agentInstanceId: agentInstance.id,
      sessionId: request.sessionId,
      model: modelName,
      toolCalls: toolCallsExecuted,
      messages: 2
    });

    await prisma.tokenUsageLog.create({
      data: {
        tenantId,
        agentInstanceId: agentInstance.id,
        sessionId: request.sessionId,
        tokensIn: null,
        tokensOut: null,
        totalTokens: TOKEN_COST_PER_MESSAGE,
        model: modelName
      }
    });

    await prisma.tokenWallet.update({
      where: { tenantId },
      data: { balance: { decrement: TOKEN_COST_PER_MESSAGE } }
    });

    return { reply: replyText || FALLBACK_REPLY };
  } catch (error) {
    const requestId = getOpenAIRequestId(error);
    console.error('OpenAI orchestrator error', requestId ?? '', error);
    return { reply: FALLBACK_REPLY };
  }
}

