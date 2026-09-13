import { prisma } from '@trends172tech/db';
import { getAgentRuntimeProfile, type AgentChannel, type RegisteredAgentKey } from '@trends172tech/core';

export class AgentPlatformSecurityError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'AgentPlatformSecurityError';
  }
}

export type AuthorizedAgentExecution = {
  tenantId: string;
  agentInstanceId: string;
  sessionId: string;
  agentKey: RegisteredAgentKey;
  channel: AgentChannel;
  endCustomerId?: string;
  agentAccessId?: string;
};

const EXTERNAL_CHANNELS = new Set<AgentChannel>(['web', 'chatgpt', 'whatsapp', 'voice', 'partner_portal']);
const DOMAIN_GOVERNED_CHANNELS = new Set<AgentChannel>(['web', 'partner_portal']);

function channelAliases(channel: AgentChannel) {
  if (channel === 'web') return ['web', 'embedded_web'];
  return [channel];
}

function normalizedHost(value?: string | null) {
  if (!value) return null;
  try {
    const url = value.includes('://') ? new URL(value) : new URL(`https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function domainAllowed(host: string, allowedDomains: string[]) {
  return allowedDomains.some((entry) => {
    const allowed = normalizedHost(entry);
    if (!allowed) return false;
    return host === allowed || host.endsWith(`.${allowed}`);
  });
}

function monthStartUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

async function enforceAgentAccess(args: {
  tenantId: string;
  agentInstanceId: string;
  channel: AgentChannel;
  requestOrigin?: string | null;
}) {
  if (!EXTERNAL_CHANNELS.has(args.channel)) return undefined;

  const access = await prisma.agentAccess.findFirst({
    where: {
      tenantId: args.tenantId,
      agentId: args.agentInstanceId,
      isActive: true,
      channel: { in: channelAliases(args.channel) }
    },
    select: {
      id: true,
      allowedDomains: true,
      maxTokensPerMonth: true
    }
  });

  if (!access) {
    throw new AgentPlatformSecurityError('Agent access is not enabled for this channel', 403);
  }

  if (DOMAIN_GOVERNED_CHANNELS.has(args.channel) && access.allowedDomains.length > 0) {
    const host = normalizedHost(args.requestOrigin);
    if (!host || !domainAllowed(host, access.allowedDomains)) {
      await prisma.accessLog.create({
        data: {
          tenantId: args.tenantId,
          agentInstanceId: args.agentInstanceId,
          agentAccessId: access.id,
          domain: host,
          channel: args.channel,
          event: 'agent.execute',
          status: 'DENIED',
          reason: 'DOMAIN_NOT_ALLOWED'
        }
      });
      throw new AgentPlatformSecurityError('Origin is not allowed for this agent access', 403);
    }
  }

  if (access.maxTokensPerMonth && access.maxTokensPerMonth > 0) {
    const aggregate = await prisma.tokenUsageLog.aggregate({
      where: {
        tenantId: args.tenantId,
        agentInstanceId: args.agentInstanceId,
        createdAt: { gte: monthStartUtc() }
      },
      _sum: { totalTokens: true }
    });
    const used = aggregate._sum.totalTokens ?? 0;
    if (used >= access.maxTokensPerMonth) {
      await prisma.accessLog.create({
        data: {
          tenantId: args.tenantId,
          agentInstanceId: args.agentInstanceId,
          agentAccessId: access.id,
          domain: normalizedHost(args.requestOrigin),
          channel: args.channel,
          event: 'agent.execute',
          status: 'DENIED',
          reason: 'MONTHLY_TOKEN_LIMIT_REACHED',
          metaJson: { usedTokens: used, maxTokensPerMonth: access.maxTokensPerMonth }
        }
      });
      throw new AgentPlatformSecurityError('Monthly agent usage limit reached', 429);
    }
  }

  await prisma.accessLog.create({
    data: {
      tenantId: args.tenantId,
      agentInstanceId: args.agentInstanceId,
      agentAccessId: access.id,
      domain: normalizedHost(args.requestOrigin),
      channel: args.channel,
      event: 'agent.execute',
      status: 'ALLOWED'
    }
  });

  return access.id;
}

export async function authorizeAgentExecution(args: {
  tenantId: string;
  agentInstanceId: string;
  sessionId: string;
  agentKey: RegisteredAgentKey;
  channel: AgentChannel;
  endCustomerId?: string;
  toolName?: string;
  requestOrigin?: string | null;
}): Promise<AuthorizedAgentExecution> {
  const profile = getAgentRuntimeProfile(args.agentKey);

  if (profile.lifecycle === 'paused' || profile.lifecycle === 'retired') {
    throw new AgentPlatformSecurityError('Agent deployment is not available', 403);
  }
  if (!profile.channels.includes(args.channel)) {
    throw new AgentPlatformSecurityError(`Channel ${args.channel} is not allowed for agent ${args.agentKey}`, 403);
  }
  if (args.toolName && !profile.allowedTools.includes(args.toolName)) {
    throw new AgentPlatformSecurityError(`Tool is not allowed for agent ${args.agentKey}`, 403);
  }

  const agent = await prisma.agentInstance.findFirst({
    where: {
      id: args.agentInstanceId,
      tenantId: args.tenantId
    },
    select: {
      id: true,
      tenantId: true,
      status: true,
      endCustomerId: true,
      tenant: { select: { status: true } }
    }
  });

  // Deliberately do not reveal whether an agent exists under another tenant.
  if (!agent) {
    throw new AgentPlatformSecurityError('Agent instance is not available for this tenant', 404);
  }
  if (agent.tenant.status !== 'ACTIVE') {
    throw new AgentPlatformSecurityError('Tenant is not active', 403);
  }
  if (agent.status !== 'ACTIVE') {
    throw new AgentPlatformSecurityError('Agent instance is not active', 403);
  }

  if (args.endCustomerId) {
    const endCustomer = await prisma.endCustomer.findFirst({
      where: { id: args.endCustomerId, tenantId: args.tenantId },
      select: { id: true }
    });
    if (!endCustomer) {
      throw new AgentPlatformSecurityError('End customer is not available for this tenant', 404);
    }
    if (agent.endCustomerId && agent.endCustomerId !== args.endCustomerId) {
      throw new AgentPlatformSecurityError('End customer is not assigned to this agent', 403);
    }
  }

  const agentAccessId = await enforceAgentAccess({
    tenantId: args.tenantId,
    agentInstanceId: args.agentInstanceId,
    channel: args.channel,
    requestOrigin: args.requestOrigin
  });

  const existingSession = await prisma.agentSession.findUnique({
    where: {
      tenantId_sessionId: {
        tenantId: args.tenantId,
        sessionId: args.sessionId
      }
    },
    select: { agentInstanceId: true, channel: true }
  });

  if (existingSession && existingSession.agentInstanceId !== args.agentInstanceId) {
    throw new AgentPlatformSecurityError('Session is already bound to another agent', 409);
  }
  if (existingSession?.channel && existingSession.channel !== args.channel) {
    throw new AgentPlatformSecurityError('Session is already bound to another channel', 409);
  }

  if (!existingSession) {
    await prisma.agentSession.create({
      data: {
        tenantId: args.tenantId,
        agentInstanceId: args.agentInstanceId,
        sessionId: args.sessionId,
        channel: args.channel
      }
    });
  }

  return {
    tenantId: args.tenantId,
    agentInstanceId: args.agentInstanceId,
    sessionId: args.sessionId,
    agentKey: args.agentKey,
    channel: args.channel,
    endCustomerId: args.endCustomerId,
    agentAccessId
  };
}
