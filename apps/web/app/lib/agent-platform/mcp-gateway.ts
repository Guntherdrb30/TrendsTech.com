import type { AgentExecutionContext, McpServerDescriptor } from '@trends172tech/core';

const MCP_PROTOCOL_VERSION = '2025-06-18';
const DEFAULT_TIMEOUT_MS = 20_000;

type JsonRpcResponse<T> = {
  jsonrpc: '2.0';
  id?: number | string;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
};

export type McpTool = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
};

export type McpCallResult = {
  content?: Array<Record<string, unknown>>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function assertServerAllowed(server: McpServerDescriptor) {
  const url = new URL(server.endpoint);
  if (url.protocol !== 'https:') throw new Error('MCP endpoint must use HTTPS');
  if (server.status === 'paused') throw new Error(`MCP server is paused: ${server.key}`);
}

async function rpc<T>(server: McpServerDescriptor, method: string, params?: Record<string, unknown>): Promise<T> {
  assertServerAllowed(server);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(server.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'mcp-protocol-version': MCP_PROTOCOL_VERSION
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: crypto.randomUUID(), method, ...(params ? { params } : {}) }),
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`MCP HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Unsupported MCP response content-type: ${contentType || 'unknown'}`);
    }
    const payload = (await response.json()) as JsonRpcResponse<T>;
    if (payload.error) throw new Error(`MCP ${payload.error.code}: ${payload.error.message}`);
    if (payload.result === undefined) throw new Error('MCP response missing result');
    return payload.result;
  } finally {
    clearTimeout(timeout);
  }
}

export async function discoverMcpTools(server: McpServerDescriptor): Promise<McpTool[]> {
  const result = await rpc<{ tools?: McpTool[] }>(server, 'tools/list', {});
  return Array.isArray(result.tools) ? result.tools : [];
}

export async function callMcpTool(args: {
  server: McpServerDescriptor;
  context: AgentExecutionContext;
  toolName: string;
  input: Record<string, unknown>;
  humanApproval?: { approvalId: string; approvedByUserId: string };
}): Promise<McpCallResult> {
  const { server, context, toolName, input } = args;
  if (!context.tenantId || !context.deploymentId || !context.agentInstanceId || !context.sessionId) {
    throw new Error('Incomplete agent execution context');
  }
  const policy = server.tools.find((tool) => tool.name === toolName);
  if (!policy) throw new Error(`Tool is not allowed by registry: ${toolName}`);
  if (policy.approval === 'human_required' && !args.humanApproval) {
    throw new Error(`Human approval required for tool: ${toolName}`);
  }
  if (policy.approval !== 'human_required' && args.humanApproval) {
    throw new Error(`Unexpected human approval evidence for tool: ${toolName}`);
  }
  return rpc<McpCallResult>(server, 'tools/call', { name: toolName, arguments: input });
}
