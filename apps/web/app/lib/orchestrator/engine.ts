import { prisma } from '@trends172tech/db';
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

function sanitizeContextPayload(payload: unknown) {
  const json = JSON.stringify(payload);
  return json.length > 4000 ? `${json.slice(0, 4000)}...` : json;
}

async function loadConversationHistory(tenantId: string, sessionId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      action: 'openai_message',
      entity: 'agent_instance',
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

async function enforceUsageLimits(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: 'ACTIVE' },
    orderBy: { startedAt: 'desc' },
    include: { plan: true }
  });

  if (!subscription?.plan) {
    return { allowed: false, reason: 'No active subscription.' };
  }

  const limits = (subscription.plan.limitsJson ?? {}) as {
    maxMessagesPerMonth?: number;
    maxToolCallsPerMonth?: number;
    allowedTools?: string[];
  };

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const usageLogs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      action: 'openai_usage',
      createdAt: { gte: since }
    },
    select: { metaJson: true }
  });

  let messageCount = 0;
  let toolCallCount = 0;
  for (const log of usageLogs) {
    if (!log.metaJson || typeof log.metaJson !== 'object') {
      continue;
    }
    const meta = log.metaJson as { messages?: number; toolCalls?: number };
    messageCount += meta.messages ?? 0;
    toolCallCount += meta.toolCalls ?? 0;
  }

  if (limits.maxMessagesPerMonth && messageCount >= limits.maxMessagesPerMonth) {
    return { allowed: false, reason: 'Message limit reached.' };
  }

  if (limits.maxToolCallsPerMonth && toolCallCount >= limits.maxToolCallsPerMonth) {
    return { allowed: false, reason: 'Tool call limit reached.' };
  }

  return {
    allowed: true,
    allowedTools: limits.allowedTools ?? TOOL_NAMES
  };
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

    const usageCheck = await enforceUsageLimits(tenantId);
    if (!usageCheck.allowed) {
      return { reply: 'Limite del plan alcanzado. Deseas contactar a un asesor humano?' };
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
    const history = await loadConversationHistory(tenantId, request.sessionId);
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
    const tools = getAgentTools(toolContext, usageCheck.allowedTools ?? TOOL_NAMES);
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

    return { reply: replyText || FALLBACK_REPLY };
  } catch (error) {
    const requestId = getOpenAIRequestId(error);
    console.error('OpenAI orchestrator error', requestId ?? '', error);
    return { reply: FALLBACK_REPLY };
  }
}

