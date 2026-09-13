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
};

export async function authorizeAgentExecution(args: {
  tenantId: string;
  agentInstanceId: string;
  sessionId: string;
  agentKey: RegisteredAgentKey;
  channel: AgentChannel;
  endCustomerId?: string;
  toolName?: string;
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

  if (!existingSession) {
    await prisma.agentSession.create({
      data: {
        tenantId: args.tenantId,
        agentInstanceId: args.agentInstanceId,
        sessionId: args.sessionId,
        channel: args.channel
      }
    });
  } else {
    await prisma.agentSession.update({
      where: {
        tenantId_sessionId: {
          tenantId: args.tenantId,
          sessionId: args.sessionId
        }
      },
      data: {
        // Preserve the original channel if present; channel transitions can be governed later.
        channel: existingSession.channel ?? args.channel
      }
    });
  }

  return {
    tenantId: args.tenantId,
    agentInstanceId: args.agentInstanceId,
    sessionId: args.sessionId,
    agentKey: args.agentKey,
    channel: args.channel,
    endCustomerId: args.endCustomerId
  };
}
