import { CARPIHOGAR_MCP, assertExecutionIsolation, type AgentChannel, type AgentExecutionContext } from '@trends172tech/core';
import { callMcpTool, discoverMcpTools } from './mcp-gateway';
import { createAgentRunTrace } from './observability';

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
  const runTrace = createAgentRunTrace({ context, mode: 'deterministic' });
  const startedAt = Date.now();

  try {
    const result = await callMcpTool({ server: CARPIHOGAR_MCP, context, toolName: args.toolName, input: args.input });
    const durationMs = Date.now() - startedAt;
    runTrace.addTool({ toolName: args.toolName, durationMs, status: 'SUCCESS' });
    const trace = await runTrace.finishSuccess();
    return {
      runId: runTrace.runId,
      context,
      mcp: CARPIHOGAR_MCP.key,
      toolName: args.toolName,
      durationMs,
      result,
      trace
    };
  } catch (error) {
    runTrace.addTool({
      toolName: args.toolName,
      durationMs: Date.now() - startedAt,
      status: 'FAILED',
      error: error instanceof Error ? error.message : String(error)
    });
    await runTrace.finishFailure(error);
    throw error;
  }
}
