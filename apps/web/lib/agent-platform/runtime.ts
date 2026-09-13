import { CARPIHOGAR_MCP, assertExecutionIsolation, type AgentChannel, type AgentExecutionContext } from '@trends172tech/core';
import { callMcpTool, discoverMcpTools } from './mcp-gateway';

export type PilotAgentRequest = {
  tenantId: string;
  agentInstanceId: string;
  sessionId: string;
  message: string;
  channel?: AgentChannel;
  userId?: string;
  projectId?: string;
  endCustomerId?: string;
};

export const CARPIHOGAR_PILOT_DEPLOYMENT_ID = 'pilot:carpihogar:customer-agent:v1';

export function contextFromRequest(request: PilotAgentRequest): AgentExecutionContext {
  const context: AgentExecutionContext = {
    tenantId: request.tenantId,
    deploymentId: CARPIHOGAR_PILOT_DEPLOYMENT_ID,
    agentInstanceId: request.agentInstanceId,
    sessionId: request.sessionId,
    channel: request.channel ?? 'api',
    userId: request.userId,
    projectId: request.projectId,
    endCustomerId: request.endCustomerId
  };
  assertExecutionIsolation(context);
  return context;
}

export async function inspectCarpiHogarPilot() {
  const tools = await discoverMcpTools(CARPIHOGAR_MCP);
  return {
    deploymentId: CARPIHOGAR_PILOT_DEPLOYMENT_ID,
    mcp: CARPIHOGAR_MCP.key,
    discoveredToolCount: tools.length,
    tools: tools.map((tool) => ({ name: tool.name, description: tool.description, annotations: tool.annotations }))
  };
}

export async function runCarpiHogarPilotTool(args: {
  request: PilotAgentRequest;
  toolName: string;
  input: Record<string, unknown>;
}) {
  const context = contextFromRequest(args.request);
  const startedAt = Date.now();
  const result = await callMcpTool({ server: CARPIHOGAR_MCP, context, toolName: args.toolName, input: args.input });
  return {
    context,
    mcp: CARPIHOGAR_MCP.key,
    toolName: args.toolName,
    durationMs: Date.now() - startedAt,
    result
  };
}
