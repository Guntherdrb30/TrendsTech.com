export type AgentLifecycleStatus = 'draft' | 'testing' | 'active' | 'paused' | 'retired';

export type ToolRiskLevel = 'read' | 'write' | 'sensitive' | 'critical';

export type ApprovalPolicy = 'automatic' | 'policy' | 'human_required';

export type AgentChannel =
  | 'web'
  | 'chatgpt'
  | 'whatsapp'
  | 'voice'
  | 'engineering_studio'
  | 'partner_portal'
  | 'api';

/**
 * Stable reusable definition owned by Trends172Tech.
 * Tenant/customer data must never be embedded in this object.
 */
export type AgentTemplateContract = {
  key: string;
  name: string;
  purpose: string;
  lifecycle: AgentLifecycleStatus;
  defaultModel?: string;
  capabilities: string[];
};

/** Immutable published version of an AgentTemplate. */
export type AgentVersionContract = {
  templateKey: string;
  version: number;
  instructionsRevision: string;
  model?: string;
  evaluationSuiteKey?: string;
  createdAt: string;
};

/**
 * Tenant-specific installation of a reusable agent version.
 * Knowledge, branding, limits and tool bindings belong here.
 */
export type AgentDeploymentContract = {
  id: string;
  tenantId: string;
  agentInstanceId: string;
  templateKey: string;
  version: number;
  status: AgentLifecycleStatus;
  channels: AgentChannel[];
  modelOverride?: string;
  monthlyBudgetUsd?: number;
};

export type ToolBindingContract = {
  key: string;
  provider: 'internal' | 'mcp' | 'connector';
  risk: ToolRiskLevel;
  approval: ApprovalPolicy;
  endpointRef?: string;
  allowedOperations?: string[];
};

/** Mandatory isolation envelope for every agent execution. */
export type AgentExecutionContext = {
  tenantId: string;
  deploymentId: string;
  agentInstanceId: string;
  sessionId: string;
  channel: AgentChannel;
  userId?: string;
  projectId?: string;
  endCustomerId?: string;
};

export type AgentRunUsage = {
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  providerCostUsd?: number;
  billableCostUsd?: number;
  durationMs?: number;
};

export const assertExecutionIsolation = (context: AgentExecutionContext) => {
  if (!context.tenantId) throw new Error('tenantId is required');
  if (!context.deploymentId) throw new Error('deploymentId is required');
  if (!context.agentInstanceId) throw new Error('agentInstanceId is required');
  if (!context.sessionId) throw new Error('sessionId is required');
};
