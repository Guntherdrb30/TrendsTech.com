import { prisma } from '@trends172tech/db';
import type { AgentInstance, EndCustomer, Tenant } from '@prisma/client';
import { searchKnowledge } from '../kb/search';

type ContextInput = {
  tenantId: string;
  agentInstanceId: string;
  sessionId: string;
  channel?: string;
  userMessage?: string;
  endUser?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
};

type SystemContext = {
  business_profile: {
    tenant_id: string;
    name: string;
    mode: string;
  };
  features: Record<string, unknown>;
  branding: Record<string, unknown>;
  language: string;
  channel: string;
  compliance: Record<string, unknown>;
  knowledge: Array<{
    content: string;
    score: number;
    meta: Record<string, unknown>;
  }>;
};

type ConversationContext = {
  session_id: string;
  end_user: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
};

function safeJson(input: unknown, fallback: Record<string, unknown>) {
  if (!input || typeof input !== 'object') {
    return fallback;
  }
  return input as Record<string, unknown>;
}

async function loadTenantData(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  return tenant;
}

async function loadAgentData(agentInstanceId: string, tenantId: string) {
  const agentInstance = await prisma.agentInstance.findFirst({
    where: { id: agentInstanceId, tenantId },
    include: { endCustomer: true }
  });
  if (!agentInstance) {
    throw new Error('Agent instance not found');
  }
  return agentInstance;
}

function buildSystemContext(
  tenant: Tenant,
  agentInstance: AgentInstance,
  knowledge: Array<{ content: string; score: number; metaJson: Record<string, unknown> | null }>,
  channel?: string
): SystemContext {
  return {
    business_profile: {
      tenant_id: tenant.id,
      name: tenant.name,
      mode: tenant.mode
    },
    features: safeJson(agentInstance.featuresJson, {}),
    branding: safeJson(agentInstance.brandingJson, {}),
    language: agentInstance.languageDefault,
    channel: channel ?? 'web',
    compliance: {},
    knowledge: knowledge.map((item) => ({
      content: item.content,
      score: item.score,
      meta: item.metaJson ?? {}
    }))
  };
}

function buildConversationContext(
  sessionId: string,
  agentInstance: AgentInstance,
  endCustomer: EndCustomer | null,
  endUser?: ContextInput['endUser']
): ConversationContext {
  const resolvedEndUser = {
    id: endUser?.id ?? endCustomer?.id,
    name: endUser?.name ?? endCustomer?.name ?? undefined,
    email: endUser?.email ?? endCustomer?.email ?? undefined,
    phone: endUser?.phone ?? endCustomer?.phone ?? undefined
  };

  return {
    session_id: sessionId,
    end_user: resolvedEndUser
  };
}

export async function buildContext(input: ContextInput) {
  const [tenant, agentInstance, knowledge] = await Promise.all([
    loadTenantData(input.tenantId),
    loadAgentData(input.agentInstanceId, input.tenantId),
    input.userMessage
      ? searchKnowledge({
          tenantId: input.tenantId,
          agentInstanceId: input.agentInstanceId,
          query: input.userMessage,
          topK: 4
        })
      : Promise.resolve([])
  ]);

  const systemContext = buildSystemContext(tenant, agentInstance, knowledge, input.channel);
  const conversationContext = buildConversationContext(
    input.sessionId,
    agentInstance,
    agentInstance.endCustomer ?? null,
    input.endUser
  );

  return {
    system_context: systemContext,
    conversation_context: conversationContext
  };
}

