import { prisma } from '@trends172tech/db';
import {
  getAgentRuntimeProfile,
  getMcpServerDescriptor,
  type AgentChannel,
  type AgentExecutionContext,
  type RegisteredAgentKey
} from '@trends172tech/core';
import { callMcpTool } from './mcp-gateway';
import { AgentPlatformSecurityError, authorizeAgentExecution } from './security';

export type ToolApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

type ApprovalMeta = {
  status: ToolApprovalStatus;
  tenantId: string;
  agentInstanceId: string;
  sessionId: string;
  agentKey: RegisteredAgentKey;
  channel: AgentChannel;
  toolName: string;
  input: Record<string, unknown>;
  requestedByUserId: string;
  endCustomerId?: string;
};

export async function requestToolApproval(args: {
  actorUserId: string;
  tenantId: string;
  agentInstanceId: string;
  sessionId: string;
  agentKey: RegisteredAgentKey;
  channel: AgentChannel;
  toolName: string;
  input: Record<string, unknown>;
  endCustomerId?: string;
  requestOrigin?: string | null;
}) {
  const profile = getAgentRuntimeProfile(args.agentKey);
  const server = getMcpServerDescriptor(profile.mcpKey);
  const descriptor = server.tools.find((tool) => tool.name === args.toolName);
  if (!descriptor || !profile.allowedTools.includes(args.toolName)) {
    throw new AgentPlatformSecurityError('Tool is not allowed for this agent', 403);
  }
  if (descriptor.approval !== 'human_required') {
    throw new AgentPlatformSecurityError('Tool does not require human approval', 400);
  }

  await authorizeAgentExecution({
    tenantId: args.tenantId,
    agentInstanceId: args.agentInstanceId,
    sessionId: args.sessionId,
    agentKey: args.agentKey,
    channel: args.channel,
    endCustomerId: args.endCustomerId,
    toolName: args.toolName,
    requestOrigin: args.requestOrigin
  });

  const approvalId = crypto.randomUUID();
  const meta: ApprovalMeta = {
    status: 'PENDING',
    tenantId: args.tenantId,
    agentInstanceId: args.agentInstanceId,
    sessionId: args.sessionId,
    agentKey: args.agentKey,
    channel: args.channel,
    toolName: args.toolName,
    input: args.input,
    requestedByUserId: args.actorUserId,
    endCustomerId: args.endCustomerId
  };

  await prisma.auditLog.create({
    data: {
      actorUserId: args.actorUserId,
      tenantId: args.tenantId,
      action: 'agent.tool.approval.requested',
      entity: 'agent_tool_approval',
      entityId: approvalId,
      metaJson: meta
    }
  });

  return { approvalId, status: 'PENDING' as const, toolName: args.toolName };
}

async function loadApproval(approvalId: string, tenantId: string) {
  const events = await prisma.auditLog.findMany({
    where: { entity: 'agent_tool_approval', entityId: approvalId, tenantId },
    orderBy: { createdAt: 'asc' },
    select: { action: true, actorUserId: true, metaJson: true, createdAt: true }
  });
  const requested = events.find((event) => event.action === 'agent.tool.approval.requested');
  if (!requested || !requested.metaJson || typeof requested.metaJson !== 'object' || Array.isArray(requested.metaJson)) {
    throw new AgentPlatformSecurityError('Approval request not found', 404);
  }
  const meta = requested.metaJson as unknown as ApprovalMeta;
  const approved = events.findLast((event) => event.action === 'agent.tool.approval.approved');
  const rejected = events.findLast((event) => event.action === 'agent.tool.approval.rejected');
  const executed = events.findLast((event) => event.action === 'agent.tool.approval.executed');
  return { meta, requested, approved, rejected, executed };
}

export async function decideToolApproval(args: {
  approvalId: string;
  tenantId: string;
  approverUserId: string;
  decision: 'approve' | 'reject';
}) {
  const approval = await loadApproval(args.approvalId, args.tenantId);
  if (approval.executed) throw new AgentPlatformSecurityError('Approval has already been executed', 409);
  if (approval.rejected) throw new AgentPlatformSecurityError('Approval has already been rejected', 409);
  if (approval.approved) throw new AgentPlatformSecurityError('Approval has already been approved', 409);

  const action = args.decision === 'approve' ? 'agent.tool.approval.approved' : 'agent.tool.approval.rejected';
  await prisma.auditLog.create({
    data: {
      actorUserId: args.approverUserId,
      tenantId: args.tenantId,
      action,
      entity: 'agent_tool_approval',
      entityId: args.approvalId,
      metaJson: { decision: args.decision }
    }
  });

  return { approvalId: args.approvalId, status: args.decision === 'approve' ? 'APPROVED' : 'REJECTED' } as const;
}

export async function executeApprovedTool(args: {
  approvalId: string;
  tenantId: string;
  executorUserId: string;
}) {
  const approval = await loadApproval(args.approvalId, args.tenantId);
  if (!approval.approved) throw new AgentPlatformSecurityError('Human approval is required', 403);
  if (approval.rejected) throw new AgentPlatformSecurityError('Approval was rejected', 403);
  if (approval.executed) throw new AgentPlatformSecurityError('Approval has already been executed', 409);

  const { meta } = approval;
  const profile = getAgentRuntimeProfile(meta.agentKey);
  const server = getMcpServerDescriptor(profile.mcpKey);
  const descriptor = server.tools.find((tool) => tool.name === meta.toolName);
  if (!descriptor || descriptor.approval !== 'human_required') {
    throw new AgentPlatformSecurityError('Approved tool policy is no longer valid', 409);
  }

  await authorizeAgentExecution({
    tenantId: meta.tenantId,
    agentInstanceId: meta.agentInstanceId,
    sessionId: meta.sessionId,
    agentKey: meta.agentKey,
    channel: meta.channel,
    endCustomerId: meta.endCustomerId,
    toolName: meta.toolName
  });

  const context: AgentExecutionContext = {
    tenantId: meta.tenantId,
    deploymentId: profile.deploymentId,
    agentInstanceId: meta.agentInstanceId,
    sessionId: meta.sessionId,
    channel: meta.channel,
    userId: args.executorUserId,
    endCustomerId: meta.endCustomerId
  };

  const result = await callMcpTool({
    server,
    context,
    toolName: meta.toolName,
    input: meta.input,
    humanApproval: { approvalId: args.approvalId, approvedByUserId: approval.approved.actorUserId }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: args.executorUserId,
      tenantId: args.tenantId,
      action: 'agent.tool.approval.executed',
      entity: 'agent_tool_approval',
      entityId: args.approvalId,
      metaJson: { toolName: meta.toolName, approvedByUserId: approval.approved.actorUserId }
    }
  });

  return { approvalId: args.approvalId, status: 'EXECUTED' as const, toolName: meta.toolName, result };
}
