import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { AgentExecutionContext, McpServerDescriptor } from '@trends172tech/core';

const DEFAULT_TIMEOUT_MS = 20_000;

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

async function withMcpClient<T>(server: McpServerDescriptor, operation: (client: Client) => Promise<T>): Promise<T> {
  assertServerAllowed(server);
  const client = new Client({ name: 'trends172-agent-platform', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(server.endpoint));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    await client.connect(transport, { signal: controller.signal });
    return await operation(client);
  } finally {
    clearTimeout(timeout);
    await client.close().catch(() => undefined);
  }
}

export async function discoverMcpTools(server: McpServerDescriptor): Promise<McpTool[]> {
  return withMcpClient(server, async (client) => {
    const tools: McpTool[] = [];
    let cursor: string | undefined;
    do {
      const result = await client.listTools(cursor ? { cursor } : undefined);
      tools.push(...result.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema as Record<string, unknown>,
        annotations: tool.annotations as Record<string, unknown> | undefined
      })));
      cursor = result.nextCursor;
    } while (cursor);
    return tools;
  });
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

  return withMcpClient(server, async (client): Promise<McpCallResult> => {
    const result = await client.callTool({ name: toolName, arguments: input });
    return {
      content: Array.isArray(result.content) ? result.content as Array<Record<string, unknown>> : undefined,
      structuredContent: result.structuredContent as Record<string, unknown> | undefined,
      isError: typeof result.isError === 'boolean' ? result.isError : undefined
    };
  });
}
